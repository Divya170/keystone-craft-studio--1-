import { Injectable } from '@nestjs/common';
import { InquiriesService } from '../inquiries/inquiries.service';
import { RegistrationsService } from '../registrations/registrations.service';
import { ContentService } from '../content/content.service';
import { ContentType } from '../content/entities/content-block.entity';
import { SettingsService } from '../settings/settings.service';
import { CategoriesService } from '../categories/categories.service';
import { ProductsService } from '../products/products.service';
import { WorkshopsService } from '../workshops/workshops.service';

type Tone = 'good' | 'warn' | 'off';

/** Admin home: inbox counts, recent activity and a "what's still missing"
 * checklist built from live data (mirrors the comp's CMS notes). */
@Injectable()
export class DashboardService {
  constructor(
    private readonly inquiries: InquiriesService,
    private readonly registrations: RegistrationsService,
    private readonly content: ContentService,
    private readonly settings: SettingsService,
    private readonly categories: CategoriesService,
    private readonly products: ProductsService,
    private readonly workshops: WorkshopsService,
  ) {}

  async get() {
    const [newInq, newReg, recentInq, recentReg, s, faq, cats, liveProducts, ws, team] = await Promise.all([
      this.inquiries.countNew(),
      this.registrations.countNew(),
      this.inquiries.recent(5),
      this.registrations.recent(5),
      this.settings.get(),
      this.content.findFaq(),
      this.categories.findAllAdmin(),
      this.products.countPublished(),
      this.workshops.findAllAdmin(),
      this.content.findPublic(ContentType.TEAM_MEMBER),
    ]);
    const pubCats = cats.filter((c) => c.published).length;
    const pubWs = ws.filter((w) => w.published).length;
    const contact = [s.address, s.hours, s.email, s.phone].filter(Boolean).length;
    const row = (name: string, status: string, tone: Tone, href: string) => ({ name, status, tone, href });

    return {
      metrics: [
        { key: 'New inquiries', value: newInq, href: '/admin/inquiries' },
        { key: 'New registrations', value: newReg, href: '/admin/registrations' },
        { key: 'Products live', value: liveProducts, href: '/admin/products' },
        { key: 'Workshops live', value: pubWs, href: '/admin/workshops' },
      ],
      recentInquiries: recentInq,
      recentRegistrations: recentReg,
      checklist: [
        row('Categories', pubCats ? `${pubCats} published` : `${cats.length} draft${cats.length === 1 ? '' : 's'} — rename & publish`, pubCats ? 'good' : 'warn', '/admin/categories'),
        row('Products', liveProducts ? `${liveProducts} live` : 'None yet', liveProducts ? 'good' : 'warn', '/admin/products'),
        row('Workshops', pubWs ? `${pubWs} published` : `${ws.length} draft${ws.length === 1 ? '' : 's'}`, pubWs ? 'good' : 'warn', '/admin/workshops'),
        row('FAQ answers', `${faq.approved} of ${faq.total} answered`, faq.approved === faq.total ? 'good' : 'warn', '/admin/content'),
        row('Studio story & philosophy', s.story && s.philosophyQuote ? 'Complete' : 'Awaiting copy', s.story && s.philosophyQuote ? 'good' : 'warn', '/admin/settings'),
        row('Home studio summary', s.studioSummary ? 'Complete' : 'Awaiting copy', s.studioSummary ? 'good' : 'warn', '/admin/settings'),
        row('Contact details', contact === 4 ? 'Complete' : `${contact} of 4 supplied`, contact === 4 ? 'good' : 'warn', '/admin/settings'),
        row('Team profiles', team.length ? `${team.length} shown` : 'None (section hidden)', team.length ? 'good' : 'off', '/admin/content'),
      ],
    };
  }
}
