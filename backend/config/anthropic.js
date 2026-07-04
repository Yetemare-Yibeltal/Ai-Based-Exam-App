const Anthropic = require("@anthropic-ai/sdk");

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const AI_MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";

const AI_CONFIG = {
  model: AI_MODEL,
  max_tokens: 2048,
  temperature: 0.7,
};

const generateWithAI = async (prompt, options = {}) => {
  try {
    const response = await anthropic.messages.create({
      model: options.model || AI_CONFIG.model,
      max_tokens: options.max_tokens || AI_CONFIG.max_tokens,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    return {
      success: true,
      content: response.content[0].text,
      usage: response.usage,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

const streamWithAI = async (prompt, onChunk, options = {}) => {
  try {
    const stream = await anthropic.messages.stream({
      model: options.model || AI_CONFIG.model,
      max_tokens: options.max_tokens || AI_CONFIG.max_tokens,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    for await (const chunk of stream) {
      if (
        chunk.type === "content_block_delta" &&
        chunk.delta.type === "text_delta"
      ) {
        onChunk(chunk.delta.text);
      }
    }

    const finalMessage = await stream.finalMessage();
    return {
      success: true,
      usage: finalMessage.usage,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

module.exports = {
  anthropic,
  AI_CONFIG,
  generateWithAI,
  streamWithAI,
};
