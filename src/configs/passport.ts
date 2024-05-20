import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { config } from "./config";
import { tokenTypes } from "./tokens";
import { StrategyOptions } from "passport-jwt";
import { userService } from "../services";

const jwtOptions: StrategyOptions = {
  secretOrKey: config.jwt.secret,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
};

const jwtVerify = async (
  payload: any,
  done: (error: any, user?: any) => void
) => {
  try {
    if (payload.type !== tokenTypes.ACCESS) {
      throw new Error("Invalid token type");
    }

    // TODO: Need to change userService variable getUserByEmail to getUserUnique
    const user = await userService.getUserByEmail(
      { id: payload.sub.id },
      {
        role: {
          select: {
            permission: true,
          },
        },
      }
    );

    if (!user) {
      return done(null, false);
    }
    done(null, user);
  } catch (error) {
    done(error, false);
  }
};

const jwtStrategy = new JwtStrategy(jwtOptions, jwtVerify);

export { jwtStrategy };
