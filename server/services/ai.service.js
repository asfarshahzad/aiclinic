import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

const FALLBACK_MSG = 'AI temporarily unavailable. Please try again later.';

async function callGemini(prompt, systemInstruction = '') {
  if (!genAI) return { success: false, message: FALLBACK_MSG };
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: systemInstruction || 'You are a helpful medical assistant. Provide clear, concise responses.'
    });
    const result = await model.generateContent(prompt);
    const text = result.response?.text?.() || '';
    return { success: true, data: text };
  } catch (err) {
    console.error('Gemini API error:', err);
    return { success: false, message: FALLBACK_MSG };
  }
}

export async function getSymptomAnalysis({ symptoms, age, gender, history }) {
  const prompt = `As a medical assistant, analyze these symptoms and provide a structured JSON response:
Symptoms: ${symptoms}
Age: ${age}
Gender: ${gender}
Medical History: ${history || 'Not provided'}

Respond with ONLY valid JSON in this exact format:
{
  "possibleConditions": ["condition1", "condition2"],
  "riskLevel": "low|medium|high",
  "suggestedTests": ["test1", "test2"],
  "summary": "Brief summary"
}`;
  const result = await callGemini(prompt);
  if (!result.success) return result;
  try {
    const json = JSON.parse(result.data.replace(/```json\n?|\n?```/g, '').trim());
    return { success: true, data: json };
  } catch {
    return { success: true, data: { possibleConditions: [], riskLevel: 'low', suggestedTests: [], summary: result.data } };
  }
}

export async function getPrescriptionExplanation(medicines, diagnosis) {
  const medsList = medicines.map(m => `${m.name} - ${m.dosage}, ${m.frequency}, ${m.duration}`).join('\n');
  const prompt = `Explain this prescription in simple language for a patient:
Diagnosis: ${diagnosis || 'Not specified'}
Medicines:
${medsList}

Provide:
1. Simple explanation of what each medicine does (1-2 sentences each)
2. Lifestyle recommendations
3. Preventive advice
4. When to seek immediate help`;
  return callGemini(prompt);
}

export async function getRiskFlags(patientId, DiagnosisLog, Prescription) {
  try {
    const logs = await DiagnosisLog.find({ patientId }).sort({ createdAt: -1 }).limit(20).lean();
    const scripts = await Prescription.find({ patientId }).sort({ createdAt: -1 }).limit(20).lean();
    const conditions = logs.map(l => l.aiResponse?.possibleConditions || []).flat();
    const risks = [];
    const countMap = {};
    conditions.forEach(c => { countMap[c] = (countMap[c] || 0) + 1; });
    const repeated = Object.entries(countMap).filter(([, v]) => v >= 3);
    if (repeated.length) risks.push({ type: 'repeated', message: `Repeated conditions: ${repeated.map(([k]) => k).join(', ')}` });
    const highRisk = logs.filter(l => l.riskLevel === 'high');
    if (highRisk.length >= 2) risks.push({ type: 'chronic', message: 'Multiple high-risk diagnoses detected' });
    return { success: true, data: risks };
  } catch (err) {
    console.error('Risk flagging error:', err);
    return { success: false, data: [] };
  }
}
