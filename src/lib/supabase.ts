import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

/**
 * Supabase 클라이언트. 공개(publishable) 키를 쓰며, 접근 범위는 DB의 RLS로 제한됩니다
 * (waitlist에 '추가'만 가능, 조회·수정·삭제 불가).
 * 환경 변수가 없으면 null — 신청 시 오류로 안내합니다.
 */
export const supabase =
  url && key ? createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } }) : null;
