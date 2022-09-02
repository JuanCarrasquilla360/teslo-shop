import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, SetMetadata } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { GetRawHeaders, GetUser, RoleProtected } from './decorators';
import { CreateUserDto, LoginUserDto } from './dto';
import { User } from './entities/user.entity';
import { UserRoleGuard } from './guards/user-role.guard';
import { ValidRoles } from './interfaces';
import { Auth } from './decorators/auth.decorator';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Authorization')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('register')
  createUser(@Body() createAuthDto: CreateUserDto) {
    return this.authService.create(createAuthDto);
  }


  @Post('login')
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Get('private')
  @UseGuards(AuthGuard())
  testingPrivateRoute(
    @GetUser() user: User,
    @GetUser('email') userEmail: string,
    @GetRawHeaders() rawHeaders: any
  ) {
    return {
      ok: true,
      message: 'hola mundo private',
      user,
      userEmail,
      rawHeaders
    }
  }

  @Get('private2')
  @RoleProtected(ValidRoles.superUser, ValidRoles.admin)
  @UseGuards(AuthGuard(), UserRoleGuard)
  testingPrivateRoute2(
    @GetUser() user: User,
  ) {
    return {
      ok: true,
      message: 'hola mundo private',
      user,
    }
  }

  @Get('private3')
  @Auth(ValidRoles.superUser, ValidRoles.admin)
  testingPrivateRoute3(
    @GetUser() user: User,
  ) {
    return {
      ok: true,
      message: 'hola mundo private',
      user,
    }
  }

  @Get('check-status')
  @Auth()
  checkOutStatus(
    @GetUser() user: User,
  ) {
    return this.authService.checkOutStatus(user)
  }


}
