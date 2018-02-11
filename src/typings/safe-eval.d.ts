declare module "safe-eval" {
    function safeEval(code: string, context?: any, options?: any): any;
    export = safeEval;
}