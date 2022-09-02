import { createParamDecorator, ExecutionContext, InternalServerErrorException } from '@nestjs/common';


export const GetRawHeaders = createParamDecorator(
    (data, ctx: ExecutionContext) => {
        const req = ctx.switchToHttp().getRequest()
        const rawHeaders = req.rawHeaders
        return rawHeaders
    }
)