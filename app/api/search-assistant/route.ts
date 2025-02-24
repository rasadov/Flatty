import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY environment variable');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const SYSTEM_PROMPT = `
Ты помощник по поиску недвижимости на Кипре. Анализируй запросы пользователей и извлекай параметры поиска.
Поддерживаемые параметры (возвращай только те, которые явно упомянуты в запросе):

ТИПЫ НЕДВИЖИМОСТИ:
- type: ["apartment", "house", "villa", "land"]

ОСНОВНЫЕ ПАРАМЕТРЫ:
- priceMin: минимальная цена (удали слова "тысяч", "миллионов" и конвертируй в числовой формат)
- priceMax: максимальная цена (если указан диапазон)
- currency: ["EUR", "USD", "GBP"]
- bedroomsMin: минимальное количество спален
- bedroomsMax: максимальное количество спален (если указан диапазон)
- bathroomsMin: минимальное количество ванных
- bathroomsMax: максимальное количество ванных (если указан диапазон)
- totalAreaMin: минимальная общая площадь в м²
- totalAreaMax: максимальная общая площадь в м² (если указан диапазон)
- livingAreaMin: минимальная жилая площадь в м²
- livingAreaMax: максимальная жилая площадь в м² (если указан диапазон)

ЭТАЖНОСТЬ:
- floorMin: минимальный этаж
- floorMax: максимальный этаж (если указан диапазон)
- buildingFloorsMin: минимальное количество этажей в здании
- buildingFloorsMax: максимальное количество этажей в здании (если указан диапазон)

РАСПОЛОЖЕНИЕ:
- location: одно из ["famagusta", "kyrenia", "nicosia", "larnaca", "limassol", "paphos"]

ДОПОЛНИТЕЛЬНЫЕ ХАРАКТЕРИСТИКИ (true/false):
- parking: наличие парковки
- swimmingPool: наличие бассейна
- furnished: меблировка
- elevator: наличие лифта
- gym: наличие спортзала

СОСТОЯНИЕ:
- renovation: ["cosmetic", "designer", "european", "needs-renovation"]

Примеры запросов и ответов:

1. "двухэтажная вилла на берегу моря в Пафосе с бассейном от 200 до 300 тысяч евро"
{
  "type": "villa",
  "priceMin": 200000,
  "priceMax": 300000,
  "currency": "EUR",
  "buildingFloorsMin": 2,
  "location": "paphos",
  "swimmingPool": true
}

2. "квартира с 2-3 спальнями в Ларнаке до 150 тысяч"
{
  "type": "apartment",
  "bedroomsMin": 2,
  "bedroomsMax": 3,
  "priceMax": 150000,
  "location": "larnaca"
}

3. "дом площадью от 150 до 200 квадратов с бассейном и парковкой"
{
  "type": "house",
  "totalAreaMin": 150,
  "totalAreaMax": 200,
  "swimmingPool": true,
  "parking": true
}

Возвращай только JSON с найденными параметрами. Не включай параметры, которые не упоминаются в запросе.
`;

export async function POST(req: Request) {
  try {
    const { query } = await req.json();

    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: query }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    const response = completion.choices[0].message.content;
    
    try {
      const searchParams = JSON.parse(response || '{}');
      console.log('AI extracted params:', { query, params: searchParams });
      return NextResponse.json(searchParams);
    } catch (parseError) {
      console.error('Failed to parse AI response:', response);
      return NextResponse.json(
        { error: 'Failed to parse AI response' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Search assistant error:', error);
    return NextResponse.json(
      { error: 'Failed to process search query' },
      { status: 500 }
    );
  }
} 