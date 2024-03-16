import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserCreateDTO } from './dto/user.create.dto';
import { Repository } from 'typeorm';
import { UserEntity } from './entity/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRespository: Repository<UserEntity>,
  ) {}

  async postUSer(data: UserCreateDTO) {
    try {
      if (await this.userRespository.existsBy({ email: data.email })) {
        throw new BadRequestException('Você não pode usar esse email');
      }
      data.password = await bcrypt.hash(data.password, await bcrypt.genSalt());
      const user = this.userRespository.create(data);
      return this.userRespository.save(user);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async getUser(id: number) {
    await this.exists(id);

    return this.userRespository.findOne({
      where: {
        id,
      },
    });
  }

  async getUsers() {
    return this.userRespository.find();
  }

  async putUser(id: number, { name, email, password, birthAt, role }) {
    await this.exists(id);

    if (password) {
      password = await bcrypt.hash(password, await bcrypt.genSalt());
    }

    await this.userRespository.update(id, {
      email,
      name,
      password,
      birthAt: birthAt ? new Date(Date.parse(birthAt) + 180 * 60000) : null,
      role,
    });

    return this.getUser(id);
  }

  async patchUser(id: number, { email, name, password, birthAt, role }) {
    await this.exists(id);
    const data: any = {};
    if (name) {
      data.name = name;
    }
    if (email) {
      data.email = email;
    }
    if (password) {
      data.password = await bcrypt.hash(password, await bcrypt.genSalt());
    }
    if (birthAt) {
      data.birthAt = new Date(Date.parse(birthAt) + 180 * 60000);
    }
    if (role) {
      data.role = role;
    }
    await this.userRespository.update(id, data);

    return this.getUser(id);
  }

  async deleteUser(id: number) {
    await this.exists(id);
    return this.userRespository.delete(id);
  }

  async exists(id: number) {
    if (
      !(await this.userRespository.exists({
        where: {
          id,
        },
      }))
    ) {
      throw new NotFoundException(`O usuário ${id} não existe.`);
    }
  }
}
