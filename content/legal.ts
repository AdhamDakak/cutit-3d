import type { AppLanguage } from '@/lib/i18n'

// TODO(legal): both documents below are short placeholders written by the team, NOT reviewed legal text. They must
// be replaced/approved by a lawyer (Egyptian consumer + data-protection law, Law No. 151 of 2020) before launch.

export const LEGAL_LAST_UPDATED = '2026-10-12'

export type LegalSection = { heading: string; paragraphs: string[] }
export type LegalDocument = { sections: LegalSection[] }
export type LegalDocumentId = 'terms' | 'privacy'

export const legalContent: Record<AppLanguage, Record<LegalDocumentId, LegalDocument>> = {
  en: {
    terms: {
      sections: [
        {
          heading: 'Using Cutit',
          paragraphs: [
            'Cutit connects you with salons, barbershops and independent stylists in Egypt. By creating an account or making a booking you agree to these terms.',
            'You need a valid mobile number to book. Keep your account details accurate and don’t share access to your account.',
          ],
        },
        {
          heading: 'Bookings and cancellations',
          paragraphs: [
            'A booking is a request until the salon or stylist accepts it; its status then changes from Pending to Confirmed.',
            'You can cancel or reschedule from the booking’s Help screen. Salons and stylists may set their own late-cancellation or no-show rules, which will be shown before you confirm once they apply.',
          ],
        },
        {
          heading: 'Payments and fees',
          paragraphs: [
            'Prices are shown in Egyptian pounds and are set by the salon or stylist. You can pay in cash at your appointment, by card, or from your Cutit Wallet where available.',
            'Wallet balance can only be used inside Cutit and isn’t transferable.',
          ],
        },
        {
          heading: 'Cutit Go travel fees',
          paragraphs: ['Cutit Go bookings include a travel fee based on your area. It is always shown on its own line before you confirm and is part of the total you pay.'],
        },
        {
          heading: 'Reviews and conduct',
          paragraphs: [
            'Reviews must be about a real, completed booking and must be honest and respectful. We may remove reviews or photos that are abusive, misleading or unrelated.',
            'Treat salon staff and stylists with respect. We may suspend accounts involved in harassment or repeated no-shows.',
          ],
        },
        {
          heading: 'Liability',
          paragraphs: ['Services are provided by the salons and stylists themselves. Cutit is responsible for the booking platform, and will help resolve issues you report, but is not the provider of the service.'],
        },
        {
          heading: 'Changes to these terms',
          paragraphs: ['We may update these terms. We’ll tell you in the app before important changes take effect; continuing to use Cutit after that means you accept them.'],
        },
      ],
    },
    privacy: {
      sections: [
        {
          heading: 'Data we collect',
          paragraphs: [
            'Your phone number, name and email address; the addresses you save; your location while you use Explore (only with your permission); your booking history; and any photos you add to reviews or issue reports.',
          ],
        },
        {
          heading: 'How we use it',
          paragraphs: [
            'To run your account and bookings, show salons and stylists near you, send booking reminders you’ve turned on, handle support requests, and improve Cutit.',
          ],
        },
        {
          heading: 'Sharing',
          paragraphs: [
            'We share your details with a salon or stylist only for your bookings with them — for example your name, phone number and, for Cutit Go, your address. We don’t sell your personal data.',
          ],
        },
        {
          heading: 'Your rights',
          paragraphs: [
            'You can see and edit your profile and saved addresses at any time, turn location and notifications off in your device settings, and ask us to export or delete your data.',
          ],
        },
        {
          heading: 'Contact',
          paragraphs: ['Questions about your data? Reach us through Chat Support in the app.'],
        },
      ],
    },
  },
  ar: {
    terms: {
      sections: [
        {
          heading: 'استخدام Cutit',
          paragraphs: [
            'يربطك Cutit بالصالونات ومحلات الحلاقة والمصففين المستقلين في مصر. بإنشاء حساب أو إجراء حجز فإنك توافق على هذه الشروط.',
            'تحتاج إلى رقم هاتف محمول صالح للحجز. حافظ على دقة بيانات حسابك ولا تشارك الدخول إليه مع غيرك.',
          ],
        },
        {
          heading: 'الحجوزات والإلغاء',
          paragraphs: [
            'يظل الحجز طلباً حتى يقبله الصالون أو المصفف، فتتغير حالته من «قيد الانتظار» إلى «مؤكد».',
            'يمكنك إلغاء الحجز أو تغيير موعده من شاشة المساعدة الخاصة به. قد يضع الصالون أو المصفف قواعد للإلغاء المتأخر أو عدم الحضور، وستظهر لك قبل التأكيد عند تطبيقها.',
          ],
        },
        {
          heading: 'الدفع والرسوم',
          paragraphs: [
            'تُعرض الأسعار بالجنيه المصري ويحددها الصالون أو المصفف. يمكنك الدفع نقداً عند الموعد، أو بالبطاقة، أو من محفظة Cutit متى توفرت.',
            'رصيد المحفظة يُستخدم داخل Cutit فقط ولا يمكن تحويله.',
          ],
        },
        {
          heading: 'رسوم الانتقال في Cutit Go',
          paragraphs: ['تشمل حجوزات Cutit Go رسوم انتقال تُحسب حسب منطقتك، وتظهر دائماً في سطر منفصل قبل التأكيد وتدخل ضمن المبلغ الإجمالي.'],
        },
        {
          heading: 'التقييمات والسلوك',
          paragraphs: [
            'يجب أن يكون التقييم عن حجز حقيقي مكتمل، وأن يكون صادقاً ومحترماً. قد نحذف التقييمات أو الصور المسيئة أو المضللة أو غير المتعلقة بالخدمة.',
            'تعامل باحترام مع العاملين في الصالونات والمصففين. قد نوقف الحسابات المتورطة في الإساءة أو تكرار عدم الحضور.',
          ],
        },
        {
          heading: 'المسؤولية',
          paragraphs: ['يقدّم الصالونات والمصففون الخدمات بأنفسهم. Cutit مسؤول عن منصة الحجز وسيساعد في حل المشكلات التي تبلغ عنها، لكنه ليس مقدّم الخدمة.'],
        },
        {
          heading: 'التعديلات على الشروط',
          paragraphs: ['قد نحدّث هذه الشروط، وسنبلغك داخل التطبيق قبل سريان أي تغيير مهم. استمرارك في استخدام Cutit بعد ذلك يعني موافقتك عليها.'],
        },
      ],
    },
    privacy: {
      sections: [
        {
          heading: 'البيانات التي نجمعها',
          paragraphs: [
            'رقم هاتفك واسمك وبريدك الإلكتروني، والعناوين التي تحفظها، وموقعك أثناء استخدام «استكشاف» (بإذنك فقط)، وسجل حجوزاتك، والصور التي تضيفها إلى التقييمات أو البلاغات.',
          ],
        },
        {
          heading: 'كيف نستخدمها',
          paragraphs: ['لإدارة حسابك وحجوزاتك، وعرض الصالونات والمصففين القريبين منك، وإرسال تذكيرات الحجز التي فعّلتها، ومعالجة طلبات الدعم، وتحسين Cutit.'],
        },
        {
          heading: 'المشاركة',
          paragraphs: ['نشارك بياناتك مع الصالون أو المصفف فقط فيما يخص حجوزاتك معه، مثل اسمك ورقم هاتفك، وعنوانك في حجوزات Cutit Go. لا نبيع بياناتك الشخصية.'],
        },
        {
          heading: 'حقوقك',
          paragraphs: ['يمكنك الاطلاع على ملفك وعناوينك المحفوظة وتعديلها في أي وقت، وإيقاف الموقع والإشعارات من إعدادات جهازك، وطلب تصدير بياناتك أو حذفها.'],
        },
        {
          heading: 'التواصل',
          paragraphs: ['لديك سؤال عن بياناتك؟ تواصل معنا عبر «الدعم عبر المحادثة» داخل التطبيق.'],
        },
      ],
    },
  },
}
