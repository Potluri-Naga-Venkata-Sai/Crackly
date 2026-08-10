import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createBrowserClient(supabaseUrl, supabaseKey)

export async function saveSubmissionLocallyAndToCloud(moduleKey: string, submission: any) {
  // Save locally first
  const savedSubmissions = localStorage.getItem(`${moduleKey}_submissions`);
  let submissions = savedSubmissions ? JSON.parse(savedSubmissions) : [];
  submissions = [submission, ...submissions];
  localStorage.setItem(`${moduleKey}_submissions`, JSON.stringify(submissions));

  // Try saving to Supabase
  try {
    const { data: authData } = await supabase.auth.getUser();
    if (authData?.user) {
      await supabase.from("submissions").insert({
        user_id: authData.user.id,
        module_key: moduleKey,
        problem_id: submission.id || submission.problemTitle || submission.title,
        problem_title: submission.problemTitle || submission.title,
        problem_data: submission.problemData,
        score: submission.score,
        language: submission.language
      });
    }
  } catch (err) {
    console.error("Failed to save submission to cloud:", err);
  }
}
