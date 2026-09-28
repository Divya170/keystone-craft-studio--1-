import { Injectable, OnModuleInit, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Admin } from './entities/admin.entity';
import { LoginDto } from './dto/login.dto';

const DEFAULT_ADMIN_EMAIL = 'admin@keystonecraftstudio.com';
const DEFAULT_ADMIN_PASSWORD = 'keystone-admin-2026';

@Injectable()
export class AdminAuthService implements OnModuleInit {
  constructor(
    @InjectRepository(Admin) private readonly adminRepo: Repository<Admin>,
    private readonly jwtService: JwtService,
  ) {}

  /** Idempotent: seeds one default admin account on first boot only. */
  async onModuleInit() {
    const count = await this.adminRepo.count();
    if (count > 0) return;

    const passwordHash = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 10);
    await this.adminRepo.save(
      this.adminRepo.create({
        email: DEFAULT_ADMIN_EMAIL,
        passwordHash,
        name: 'Keystone Admin',
      }),
    );

    // eslint-disable-next-line no-console
    console.log('─────────────────────────────────────────────');
    console.log(' Seeded default admin account:');
    console.log('   Email:    ' + DEFAULT_ADMIN_EMAIL);
    console.log('   Password: ' + DEFAULT_ADMIN_PASSWORD);
    console.log(' Change this after first login.');
    console.log('─────────────────────────────────────────────');
  }

  async login(dto: LoginDto) {
    const admin = await this.adminRepo.findOne({ where: { email: dto.email.toLowerCase().trim() } });
    if (!admin) throw new UnauthorizedException('Invalid email or password.');

    const valid = await bcrypt.compare(dto.password, admin.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid email or password.');

    const token = this.jwtService.sign({ sub: admin.id, email: admin.email });
    return {
      accessToken: token,
      admin: { id: admin.id, email: admin.email, name: admin.name },
    };
  }

  async me(id: string) {
    const admin = await this.adminRepo.findOne({ where: { id } });
    if (!admin) throw new UnauthorizedException();
    return { id: admin.id, email: admin.email, name: admin.name };
  }

  async changePassword(id: string, currentPassword: string, newPassword: string) {
    const admin = await this.adminRepo.findOne({ where: { id } });
    if (!admin) throw new UnauthorizedException();
    const valid = await bcrypt.compare(currentPassword, admin.passwordHash);
    if (!valid) throw new UnauthorizedException('Current password is incorrect.');
    admin.passwordHash = await bcrypt.hash(newPassword, 10);
    await this.adminRepo.save(admin);
    return { success: true };
  }
}
