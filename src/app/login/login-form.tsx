"use client";

import { useActionState } from "react";
import { login, type LoginState } from "./actions";

export function LoginForm({ users }: { users: { id: number; name: string }[] }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, undefined);
  return (
    <form action={action} className="flex flex-col gap-4">
      <fieldset className="flex gap-3">
        <legend className="mb-2 text-sm">누구세요?</legend>
        {users.map((u) => (
          <label
            key={u.id}
            className="flex min-h-11 flex-1 cursor-pointer items-center justify-center rounded-lg border border-line bg-surface px-4 has-[:checked]:border-current has-[:checked]:font-bold"
          >
            <input
              type="radio"
              name="userId"
              value={u.id}
              defaultChecked={state?.userId === String(u.id)}
              required
              className="sr-only"
            />
            {u.name}
          </label>
        ))}
      </fieldset>
      <label className="flex flex-col gap-2 text-sm">
        비밀번호
        <input
          type="password"
          name="passcode"
          autoComplete="current-password"
          required
          className="min-h-11 rounded-lg border border-line bg-surface px-3 text-base"
        />
      </label>
      {state?.error && (
        <p role="alert" className="text-sm text-warn">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="min-h-11 rounded-lg bg-fg font-bold text-bg disabled:opacity-60"
      >
        {pending ? "확인 중…" : "들어가기"}
      </button>
    </form>
  );
}
