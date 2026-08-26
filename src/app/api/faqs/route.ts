import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { DEFAULT_FAQS_DATA } from '@/lib/faqs-data'

export async function GET() {
  try {
    const setting = await db.siteSetting.findUnique({
      where: { key: 'home_faqs' },
    })

    if (setting?.value) {
      try {
        const parsed = JSON.parse(setting.value)
        if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
          return NextResponse.json(parsed)
        }
      } catch {}
    }

    return NextResponse.json(DEFAULT_FAQS_DATA)
  } catch (error) {
    console.error('Failed to fetch FAQs:', error)
    return NextResponse.json(DEFAULT_FAQS_DATA)
  }
}
