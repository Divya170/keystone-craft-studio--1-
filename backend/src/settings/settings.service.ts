import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Settings } from './entities/settings.entity';
import { UpdateSettingsDto } from './dto/update-settings.dto';

const NULLABLE: (keyof Settings)[] = [
  'businessName', 'city', 'address', 'hours', 'email', 'phone', 'studioSummary', 'story',
  'philosophyQuote', 'philosophyText', 'mapImage', 'mapUrl',
];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

@Injectable()
export class SettingsService implements OnModuleInit {
  constructor(@InjectRepository(Settings) private readonly repo: Repository<Settings>) {}

  /** Idempotent: seeds the singleton once with the facts the comp states as
   * real (name + city). All bracketed placeholders stay null. */
  async onModuleInit() {
    if (await this.repo.findOne({ where: { id: 1 } })) return;
    await this.repo.save(
      this.repo.create({
        id: 1,
        businessName: 'Keystone Craft Studio',
        city: 'Harrisburg, Pennsylvania',
        address: null,
        hours: null,
        email: null,
        phone: null,
        studioSummary: null,
        story: null,
        philosophyQuote: null,
        philosophyText: null,
        mapImage: null,
        mapUrl: null,
        socialLinks: [],
        heroLayout: 'split',
      }),
    );
  }

  async get() {
    return (await this.repo.findOne({ where: { id: 1 } }))!;
  }

  async update(dto: UpdateSettingsDto) {
    const s = await this.get();
    if (dto.email && dto.email.trim() && !EMAIL_RE.test(dto.email.trim())) {
      throw new BadRequestException({ message: 'Enter a valid studio email.', errors: { email: 'Enter a valid studio email.' } });
    }
    Object.assign(s, dto);
    // Blank = "not supplied yet" → null, so the site hides the row.
    for (const k of NULLABLE) {
      const v = (s as any)[k];
      if (typeof v === 'string') (s as any)[k] = v.trim() ? v.trim() : null;
    }
    if (dto.socialLinks) s.socialLinks = dto.socialLinks.filter((l) => l.label?.trim() && l.url?.trim()).map((l) => ({ label: l.label.trim(), url: l.url.trim() }));
    return this.repo.save(s);
  }
}
