import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContentBlock, ContentType } from '../content/entities/content-block.entity';
import { Category } from '../categories/entities/category.entity';
import { Workshop, WorkshopStatus } from '../workshops/entities/workshop.entity';

const IMG = (f: string) => `/uploads/seed/${f}.png`;

/**
 * Idempotent first-boot seed using only what the comp presents as real (see
 * DATA-MODEL.md). Each group seeds only while empty, so admin edits and
 * deletions are never overwritten.
 *
 * Categories and workshops are seeded as UNPUBLISHED drafts: their names are
 * placeholders, but their photo pairings were deliberate. Products, story,
 * contact details, captions and team are not seeded at all.
 */
@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger('Seed');

  constructor(
    @InjectRepository(ContentBlock) private readonly content: Repository<ContentBlock>,
    @InjectRepository(Category) private readonly categories: Repository<Category>,
    @InjectRepository(Workshop) private readonly workshops: Repository<Workshop>,
  ) {}

  async onApplicationBootstrap() {
    await this.seedType(ContentType.HERO_SLIDE, [
      { image: IMG('embroidery-hoop'), alt: 'Hands stitching floral embroidery in a wooden hoop' },
      { image: IMG('studio-workspace'), alt: 'A craft workspace with shelves, baskets and macramé' },
      { image: IMG('crochet-flatlay'), alt: 'Crocheted pieces and yarn arranged on linen' },
    ]);
    await this.seedType(ContentType.SITE_IMAGE, [
      { slot: 'home-hero-inset', image: IMG('beadwork-frame'), alt: 'Hands stitching beadwork on a wooden frame' },
      { slot: 'home-studio-main', image: IMG('studio-workspace'), alt: 'A craft workspace with shelves, baskets and macramé' },
      { slot: 'home-studio-inset', image: IMG('jewelry-bench'), alt: 'A maker shaping a small piece at a workbench' },
      { slot: 'workshops-hero', image: IMG('workshop-painting'), alt: 'A long table of people painting together during a workshop' },
      { slot: 'about-story', image: IMG('studio-workspace'), alt: 'A craft workspace with shelves, baskets and macramé' },
      { slot: 'about-location', image: null, alt: 'Studio exterior, Harrisburg' },
      { slot: 'contact-moodboard', image: IMG('handmade-moodboard'), alt: 'Collage of handmade textures: crochet, linen, twine and dried flowers' },
    ]);
    await this.seedType(ContentType.GALLERY_IMAGE, [
      ['studio-workspace', 'A craft workspace with shelves, baskets and macramé', 'Workspace'],
      ['jewelry-bench', 'A maker shaping a small piece at a workbench', 'At the bench'],
      ['workshop-embroidery', 'Embroidery hoops mid-session on a shared table', 'Stitching together'],
      ['handmade-moodboard', 'Collage of handmade textures and materials', 'Textures'],
      ['workshop-pottery', 'Participants hand-building clay mugs', 'Hand-building'],
      ['supplies-flatlay', 'Twine, ribbon, paper and beads laid out', 'Materials'],
      ['embroidery-hoop', 'Hands stitching floral embroidery in a hoop', 'Slow work'],
      ['crochet-flatlay', 'Crocheted pieces and yarn on linen', 'Finished pieces'],
    ].map(([img, alt, caption]) => ({ image: IMG(img), alt, caption })));
    // About "Studio in pictures" — captions were "[Caption]" in the comp, so left blank.
    await this.seedType(ContentType.ABOUT_IMAGE, [
      { image: IMG('supplies-flatlay'), alt: 'Twine, ribbon, paper and beads laid out on a table', caption: '' },
      { image: IMG('crochet-flatlay'), alt: 'Crocheted pieces and yarn arranged on linen', caption: '' },
      { image: IMG('embroidery-hoop'), alt: 'Hands stitching floral embroidery in a wooden hoop', caption: '' },
    ]);
    await this.seedType(ContentType.FAQ_ITEM, [
      { category: 'Orders', question: 'How do I ask about a product?', answer: 'Open any product and choose “Ask About This Product”. The product name is added to your message, so the studio knows exactly what you mean.', showOnHome: true },
      { category: 'Orders', question: 'Can I buy products online?', answer: '', showOnHome: false },
      { category: 'Products', question: 'Is each piece one of a kind?', answer: '', showOnHome: false },
      { category: 'Workshops', question: 'How do I register for a workshop?', answer: 'Choose “Register” on any workshop and send the short form. The studio replies by email with dates and details.', showOnHome: true },
      { category: 'Workshops', question: 'Do I need any experience?', answer: '', showOnHome: false },
      { category: 'Materials', question: 'Are materials included in workshops?', answer: '', showOnHome: true },
      { category: 'Pickup', question: 'Can I pick up at the studio?', answer: '', showOnHome: true },
      { category: 'Delivery', question: 'Do you deliver or ship?', answer: '', showOnHome: false },
    ]);
    await this.seedCategories();
    await this.seedWorkshops();
  }

  private async seedType(type: ContentType, items: Record<string, any>[]) {
    if (await this.content.count({ where: { type } })) return;
    await this.content.save(items.map((fields, i) => this.content.create({ type, fields, sortOrder: i, published: true })));
    this.logger.log(`Seeded ${items.length} ${type} item(s).`);
  }

  private async seedCategories() {
    if (await this.categories.count()) return;
    const rows: [string, string, string][] = [
      ['Category one', 'crochet-flatlay', 'Crocheted pieces and yarn arranged on linen'],
      ['Category two', 'beadwork-frame', 'Beadwork being stitched on a wooden frame'],
      ['Category three', 'jewelry-bench', 'A maker shaping a small piece at a workbench'],
      ['Category four', 'supplies-flatlay', 'Twine, ribbon, paper and beads laid out on a table'],
    ];
    await this.categories.save(
      rows.map(([name, img, alt], i) =>
        this.categories.create({ name, slug: `category-${i + 1}`, description: null, image: IMG(img), imageAlt: alt, published: false, sortOrder: i }),
      ),
    );
    this.logger.log('Seeded 4 draft categories (unpublished — rename in admin).');
  }

  private async seedWorkshops() {
    if (await this.workshops.count()) return;
    const rows: [string, string][] = [
      ['workshop-pottery', 'Participants hand-building clay mugs around a shared table'],
      ['workshop-embroidery', 'A table of embroidery hoops mid-session, threads and flowers'],
      ['workshop-painting', 'A long table of people painting together'],
      ['embroidery-hoop', 'Hands stitching floral embroidery in a wooden hoop'],
    ];
    await this.workshops.save(
      rows.map(([img, alt], i) =>
        this.workshops.create({
          title: `Workshop title ${String(i + 1).padStart(2, '0')}`,
          slug: `workshop-${i + 1}`,
          image: IMG(img),
          imageAlt: alt,
          status: WorkshopStatus.TBA,
          published: false,
          sortOrder: i,
        }),
      ),
    );
    this.logger.log('Seeded 4 draft workshops (unpublished — add real details in admin).');
  }
}
