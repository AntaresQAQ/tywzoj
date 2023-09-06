/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/naming-convention */
namespace NodeJS {
    interface ProcessEnv {
        NODE_ENV: "development" | "production";
        TYWZOJ_CONFIG_FILE: string;
        TYWZOJ_LOG_SQL: "1" | "0";
    }
}
