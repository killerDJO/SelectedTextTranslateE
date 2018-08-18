import { empty, OperatorFunction } from "rxjs";
import { catchError } from "rxjs/operators";

export function catchErrorWithEmptyResult<TResult>(callback: (error: Error) => void): OperatorFunction<TResult, TResult> {
    return catchError<TResult, TResult>(error => {
        callback(error);
        return empty();
    });
}