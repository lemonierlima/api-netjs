import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { RoleGuard } from 'src/auth/role.guard';
import { Roles } from 'src/decorators/role.decorator';
import { Role } from 'src/enums/role.enum';
import { UserService } from './user.service';
import { UserCreateDTO } from './dto/user.create.dto';

@UseGuards(AuthGuard, RoleGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Roles(Role.Admin)
  @Post()
  async postUSer(@Body() data: UserCreateDTO) {
    return this.userService.postUSer(data);
  }

  @Roles(Role.Admin)
  @Get()
  async getUsers() {
    return this.userService.getUsers();
  }

  @Roles(Role.Admin)
  @Get(':id')
  async getUser(@Param() params) {
    return this.userService.getUser(params.id);
  }

  @Roles(Role.Admin)
  @Put(':id')
  async putUser(@Body() body, @Param() params) {
    return this.userService.putUser(params.id, body);
  }

  @Roles(Role.Admin)
  @Patch(':id')
  async patchUser(@Body() body, @Param() params) {
    return this.userService.patchUser(params.id, body);
  }

  @Roles(Role.Admin)
  @Delete(':id')
  async deleteUser(@Param() params) {
    return this.userService.deleteUser(params.id);
  }
}
