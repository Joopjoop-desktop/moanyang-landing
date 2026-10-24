import { supabase } from './supabase';

export type Os = 'windows' | 'macos';

export type JoinResult = 'ok' | 'duplicate' | 'error';

/** Postgres unique 제약 위반 — 같은 이메일로 이미 신청함 */
const UNIQUE_VIOLATION = '23505';

/**
 * 출시 알림 신청을 waitlist 테이블에 저장합니다.
 * 확인 메일은 여기서 보내지 않습니다 — confirmation_status = 'pending'으로 저장되고, 별도 메일 스크립트가 보냅니다.
 */
export async function joinWaitlist(input: {
  email: string;
  os: Os[];
  betaOptIn: boolean;
  privacyVersion: string;
}): Promise<JoinResult> {
  if (!supabase) {
    console.error('[waitlist] Supabase 환경 변수(VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY)가 없습니다.');
    return 'error';
  }

  // 조회 권한이 없으므로 저장 결과를 돌려받지 않습니다 (.select() 쓰지 않음)
  const { error } = await supabase.from('waitlist').insert({
    email: input.email.trim().toLowerCase(),
    os: input.os,
    beta_opt_in: input.betaOptIn,
    privacy_version: input.privacyVersion,
  });

  if (!error) return 'ok';
  if (error.code === UNIQUE_VIOLATION) return 'duplicate';
  console.error('[waitlist] 저장 실패', error);
  return 'error';
}
