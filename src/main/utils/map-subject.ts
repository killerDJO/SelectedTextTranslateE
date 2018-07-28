import { BehaviorSubject } from "rxjs";

export function mapSubject<TInput, TOutput>(subject$: BehaviorSubject<TInput>, selector: (value: TInput) => TOutput): BehaviorSubject<TOutput> {
    const mappedSubject$ = new BehaviorSubject<TOutput>(selector(subject$.value));
    subject$.map(selector).subscribe(mappedSubject$);
    return mappedSubject$;
}