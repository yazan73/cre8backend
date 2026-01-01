import { Injectable, InternalServerErrorException } from '@nestjs/common';
import OpenAI from 'openai';
import { ImageSize } from './image-size.enum';

@Injectable()
export class AiService {
  constructor() {}

  private client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  private basePrompt =
    process.env.AI_BASE_PROMPT ||
    'Generate a clean, print-ready product design. Avoid offensive, violent, hateful, or copyrighted content. Keep backgrounds simple and focus on the user concept.';

  private buildPrompt(userPrompt: string): string {
    return `${this.basePrompt}\nUser idea: ${userPrompt}`;
  }

  async generateImage(
    prompt: string,
    size: ImageSize = ImageSize.S1024,
  ): Promise<{ buffer: Buffer; filename: string }> {
    if (!process.env.OPENAI_API_KEY) {
      throw new InternalServerErrorException('OPENAI_API_KEY not configured');
    }

    const finalPrompt = this.buildPrompt(prompt);

    const result = await this.client.images.generate({
      model: 'gpt-image-1.5',
      prompt: finalPrompt,
      size,
    });

    const b64 = result.data?.[0]?.b64_json;
    if (!b64) throw new InternalServerErrorException('No image returned from OpenAI');
    const buffer = Buffer.from(b64, 'base64');
    return { buffer, filename: `ai-image-${Date.now()}.png` };
  }
}
