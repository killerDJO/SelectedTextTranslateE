export interface FilterOptions<TInput, TOutput> {
    execute(input: TInput): TOutput;
}