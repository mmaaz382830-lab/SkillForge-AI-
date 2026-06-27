import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  InterviewActionResult,
  InterviewMessage,
  InterviewMessageFeedback,
  InterviewSession,
  InterviewSessionView,
} from "@/types/interviews";

const SESSION_SELECT =
  "id,user_id,material_id,goal_id,topic,difficulty,status,overall_feedback,score,created_at,completed_at";

const MESSAGE_SELECT =
  "id,session_id,user_id,role,content,feedback,created_at";

export async function getAuthenticatedInterviewUserId(): Promise<
  InterviewActionResult<string>
> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return { ok: false, error: "Please log in to continue." };
  }

  return { ok: true, data: data.user.id };
}

export async function listInterviewSessionViews(): Promise<
  InterviewActionResult<InterviewSessionView[]>
> {
  const user = await getAuthenticatedInterviewUserId();

  if (!user.ok) {
    return user;
  }

  const supabase = await createSupabaseServerClient();
  const [sessionsResult, messagesResult] = await Promise.all([
    supabase
      .from("interview_sessions")
      .select(SESSION_SELECT)
      .eq("user_id", user.data)
      .order("created_at", { ascending: false })
      .returns<InterviewSession[]>(),
    supabase
      .from("interview_messages")
      .select(MESSAGE_SELECT)
      .eq("user_id", user.data)
      .eq("role", "assistant")
      .order("created_at", { ascending: true })
      .returns<InterviewMessage[]>(),
  ]);

  if (sessionsResult.error || messagesResult.error) {
    return { ok: false, error: "Could not load interview sessions." };
  }

  const messagesBySessionId = new Map<string, InterviewMessage[]>();

  for (const message of messagesResult.data ?? []) {
    const msgs = messagesBySessionId.get(message.session_id) ?? [];
    msgs.push(message);
    messagesBySessionId.set(message.session_id, msgs);
  }

  return {
    ok: true,
    data: (sessionsResult.data ?? []).map((session) => ({
      id: session.id,
      material_id: session.material_id,
      goal_id: session.goal_id,
      topic: session.topic,
      difficulty: session.difficulty,
      status: session.status,
      overall_feedback: session.overall_feedback,
      score: session.score,
      created_at: session.created_at,
      completed_at: session.completed_at,
      messages: (messagesBySessionId.get(session.id) ?? []).map((m) => ({
        id: m.id,
        session_id: m.session_id,
        role: m.role,
        content: m.content,
        feedback: m.feedback as InterviewMessageFeedback | null,
        created_at: m.created_at,
      })),
    })),
  };
}
