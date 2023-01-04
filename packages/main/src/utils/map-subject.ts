import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

export function mapSubject<TInput, TOutput>(
  subject$: BehaviorSubject<TInput>,
  selector: (value: TInput) => TOutput
): BehaviorSubject<TOutput> {
  const mappedSubject$ = new BehaviorSubject<TOutput>(selector(subject$.value));
  subject$.pipe(map(selector)).subscribe(mappedSubject$);
  return mappedSubject$;
}
