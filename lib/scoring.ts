import type { MoldType } from '@/types/molds';

function norm(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/[.,!?;:]+$/g, '')
    .replace(/\s+/g, ' ');
}

export function scoreFillInTheBlank(
  content: { options: { text: string; is_correct: boolean }[] },
  selectedIndex: number
): boolean {
  const opt = content.options[selectedIndex];
  return Boolean(opt?.is_correct);
}

export function scoreTranslateSentence(
  content: { accepted_answers_ll: string[] },
  userText: string
): boolean {
  const u = norm(userText);
  return content.accepted_answers_ll.some((a) => norm(a) === u);
}

export function scoreWordReorder(
  content: { correct_order: number[] },
  userOrder: number[]
): boolean {
  if (userOrder.length !== content.correct_order.length) return false;
  return userOrder.every((v, i) => v === content.correct_order[i]);
}

export function scoreListenAndChoose(
  content: { options: { is_correct: boolean }[] },
  selectedIndex: number
): boolean {
  return Boolean(content.options[selectedIndex]?.is_correct);
}

export function scoreSpeakTheWord(): boolean {
  return true;
}

export function scoreMatchPairs(
  content: { pairs: { al: string; ll: string }[] },
  userPairs: { al: string; ll: string }[]
): boolean {
  if (userPairs.length !== content.pairs.length) return false;
  const canon = (p: { al: string; ll: string }) =>
    `${p.al.trim()}::${p.ll.trim()}`;
  const expected = new Set(content.pairs.map(canon));
  return userPairs.every((p) => expected.has(canon(p)));
}

export function scoreImageSelect(
  content: { options: { is_correct: boolean }[] },
  selectedIndex: number
): boolean {
  return Boolean(content.options[selectedIndex]?.is_correct);
}

export function scoreConversationListen(
  content: { options: { is_correct: boolean }[] },
  selectedIndex: number
): boolean {
  return Boolean(content.options[selectedIndex]?.is_correct);
}

export function scoreSelectCorrectVerb(
  content: { options: { is_correct: boolean }[] },
  selectedIndex: number
): boolean {
  return Boolean(content.options[selectedIndex]?.is_correct);
}

export function scoreFlashcard(): boolean {
  return true;
}

export function scoreTypeWhatYouHear(
  content: { accepted_answers: string[] },
  userText: string
): boolean {
  const u = norm(userText);
  return content.accepted_answers.some((a) => norm(a) === u);
}

export function scoreTrueOrFalse(
  content: { is_translation_correct: boolean },
  userAnswer: boolean
): boolean {
  return userAnswer === content.is_translation_correct;
}

export function scoreExercise(
  moldType: string,
  content: Record<string, unknown>,
  answer: unknown
): boolean {
  switch (moldType as MoldType) {
    case 'fill_in_the_blank':
      return scoreFillInTheBlank(
        content as { options: { text: string; is_correct: boolean }[] },
        answer as number
      );
    case 'translate_sentence':
      return scoreTranslateSentence(
        content as { accepted_answers_ll: string[] },
        String(answer ?? '')
      );
    case 'word_reorder':
      return scoreWordReorder(
        content as { correct_order: number[] },
        answer as number[]
      );
    case 'listen_and_choose':
      return scoreListenAndChoose(
        content as { options: { is_correct: boolean }[] },
        answer as number
      );
    case 'speak_the_word':
      return scoreSpeakTheWord();
    case 'match_pairs':
      return scoreMatchPairs(
        content as { pairs: { al: string; ll: string }[] },
        answer as { al: string; ll: string }[]
      );
    case 'image_select':
      return scoreImageSelect(
        content as { options: { is_correct: boolean }[] },
        answer as number
      );
    case 'conversation_listen':
      return scoreConversationListen(
        content as { options: { is_correct: boolean }[] },
        answer as number
      );
    case 'select_correct_verb':
      return scoreSelectCorrectVerb(
        content as { options: { is_correct: boolean }[] },
        answer as number
      );
    case 'flashcard':
      return scoreFlashcard();
    case 'type_what_you_hear':
      return scoreTypeWhatYouHear(
        content as { accepted_answers: string[] },
        String(answer ?? '')
      );
    case 'true_or_false':
      return scoreTrueOrFalse(
        content as { is_translation_correct: boolean },
        Boolean(answer)
      );
    default:
      return false;
  }
}
