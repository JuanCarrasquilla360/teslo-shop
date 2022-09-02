import { Injectable, BadRequestException, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto, LoginUserDto } from './dto';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

import * as bc from "bcrypt";

@Injectable()
export class AuthService {

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>
    ) { }

    async create(createUseDto: CreateUserDto) {

        try {
            const { password, ...userData } = createUseDto
            const user = this.userRepository.create({
                ...userData,
                password: bc.hashSync(password, 10)
            })
            await this.userRepository.save(user)
            return user
        } catch (error) {
            this.handleDBErrors(error)
        }
    }

    async login(loginUserDto: LoginUserDto) {

        const { password, email } = loginUserDto
        const user = await this.userRepository.findOne({
            where: { email },
            select: { email: true, password: true }
        })
        if (!user) throw new UnauthorizedException('Credentials are not valid (email)')
        if (!bc.compareSync(password, user.password)) throw new UnauthorizedException('Credentials are not valid (password)')
        return user

    }

    private handleDBErrors(error: any): never {
        if (error.code === '23505') throw new BadRequestException(`${error.detail}`)
        console.log(error)
        throw new InternalServerErrorException('Please check server logs')
    }
}
