import insforge from './insforge';

const SYSTEM_PROMPT = `You are an AI Doctor in a smart clinic, providing general medical information and guidance. Always remember to display the disclaimer: This AI provides general medical information only. Always consult a licensed doctor. Engage with users in a professional and informative manner, offering basic precautions, home remedies, and necessary urgency to visit a doctor if needed. Implement emergency detection for critical symptoms and maintain a clean, modern UI design for a premium feel.`;

export const sendChatMessage = async (message, onChunk, onComplete, onError) => {
  try {
    const response = await insforge.ai.chat.completions.create({
      model: 'openai/gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: message }
      ],
      stream: !!onChunk
    });

    if (onChunk && response[Symbol.asyncIterator]) {
      let fullMessage = '';
      for await (const chunk of response) {
        if (chunk.choices[0]?.delta?.content) {
          const content = chunk.choices[0].delta.content;
          fullMessage += content;
          onChunk(content);
        }
      }
      if (onComplete) onComplete(fullMessage);
      return fullMessage;
    } else {
      const content = response.choices[0].message.content;
      if (onComplete) onComplete(content);
      return content;
    }
  } catch (err) {
    if (onError) onError(err.message || 'Error getting response from AI');
    throw err;
  }
};

export const analyzeSymptoms = async (symptoms, age, gender, history) => {
  const prompt = `You are a clinical decision support assistant. A doctor is consulting you. Patient: Age ${age}, Gender ${gender}. Symptoms: ${symptoms}. Relevant History: ${history || 'None'}. Respond ONLY in JSON format with no additional text: {"conditions":[{"name":"...","probability":"..."}],"risk_level":"low|medium|high|critical","suggested_tests":["..."],"notes":"..."}`;

  try {
    const response = await sendChatMessage(prompt);
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('No JSON found in response');
  } catch (_e) {
    return {
      conditions: [{ name: 'Analysis unavailable', probability: 'N/A' }],
      risk_level: 'unknown',
      suggested_tests: [],
      notes: 'Error parsing AI response',
    };
  }
};

export const getPatientExplanation = async (diagnosis, medicines) => {
  const prompt = `You are a friendly health communicator. Explain the following medical diagnosis to a patient in simple, non-technical language (max 3 sentences). Diagnosis: ${diagnosis}. Medicines: ${medicines}. Reassure the patient and tell them what to do next.`;

  return sendChatMessage(prompt);
};
