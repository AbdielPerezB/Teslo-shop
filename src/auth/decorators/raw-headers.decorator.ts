import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const RawHeaders = createParamDecorator(
    (data: string, context: ExecutionContext) => {

        const req = context.switchToHttp().getRequest() //viene del guard y del token
        const rawHeaders = req.rawHeaders;

        return rawHeaders;

    }
);