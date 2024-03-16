import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/user/entity/user.entity';
import { Repository } from 'typeorm';
import { AuthRegisterDTO } from './dto/auth.register.dto';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly mailerService: MailerService,
    @InjectRepository(UserEntity)
    private userRespository: Repository<UserEntity>,
  ) {}

  createToken(user: UserEntity, issuer: string) {
    return {
      accessToken: this.jwtService.sign(
        {
          id: user.id,
          name: user.name,
          email: user.email,
          birthAt: user.birthAt,
          role: user.role,
        },
        {
          expiresIn: '1h',
          subject: String(user.id),
          issuer: issuer,
        },
      ),
    };
  }

  async postLogin(email: string, password: string) {
    const user = await this.userRespository.findOne({
      where: {
        email,
      },
    });
    if (!user) {
      throw new UnauthorizedException('Email e/ou senha incorreto(s).');
    }

    if (!(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Email e/ou senha incorreto(s).');
    }

    return this.createToken(user, 'login');
  }

  async postRegister(data: AuthRegisterDTO) {
    const user = await this.userService.postUSer(data);
    return this.createToken(user, 'register');
  }

  checkToken(token: string) {
    try {
      const data = this.jwtService.verify(token, {
        issuer: 'login',
      });
      return data;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  isValidToken(token: string) {
    try {
      this.checkToken(token);
      return true;
    } catch (error) {
      return false;
    }
  }

  async postForget(email: string) {
    const user = await this.userRespository.findOne({
      where: {
        email,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Email incorreto.');
    }

    const token = this.jwtService.sign(
      {
        id: user.id,
      },
      {
        expiresIn: '30 minutes',
        subject: String(user.id),
        issuer: 'forget',
        audience: 'users',
      },
    );

    await this.mailerService.sendMail({
      subject: 'Recuperação de Senha',
      to: user.email,
      template: 'forget',
      context: {
        name: user.name,
        link: token,
      },
    });

    return true;
  }

  async reset(password: string, token: string) {
    try {
      const data: any = this.jwtService.verify(token, {
        issuer: 'forget',
        audience: 'users',
      });

      if (isNaN(Number(data.id))) {
        throw new BadRequestException('Token inválido');
      }

      password = await bcrypt.hash(password, await bcrypt.genSalt());

      await this.userRespository.update(Number(data.id), {
        password,
      });

      const user = await this.userService.getUser(Number(data.id));

      return this.createToken(user, 'login');
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
