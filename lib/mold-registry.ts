import type { ComponentType } from 'react';

import { ConversationListen } from '@/components/molds/ConversationListen';
import { FillInTheBlank } from '@/components/molds/FillInTheBlank';
import { Flashcard } from '@/components/molds/Flashcard';
import { ImageSelect } from '@/components/molds/ImageSelect';
import { ListenAndChoose } from '@/components/molds/ListenAndChoose';
import { MatchPairs } from '@/components/molds/MatchPairs';
import { SelectCorrectVerb } from '@/components/molds/SelectCorrectVerb';
import { SpeakTheWord } from '@/components/molds/SpeakTheWord';
import { TranslateSentence } from '@/components/molds/TranslateSentence';
import { TrueOrFalse } from '@/components/molds/TrueOrFalse';
import { TypeWhatYouHear } from '@/components/molds/TypeWhatYouHear';
import { WordReorder } from '@/components/molds/WordReorder';
import type { MoldProps } from '@/types/molds';

export const MoldRegistry: Record<string, ComponentType<MoldProps>> = {
  fill_in_the_blank: FillInTheBlank,
  translate_sentence: TranslateSentence,
  word_reorder: WordReorder,
  listen_and_choose: ListenAndChoose,
  speak_the_word: SpeakTheWord,
  match_pairs: MatchPairs,
  image_select: ImageSelect,
  conversation_listen: ConversationListen,
  select_correct_verb: SelectCorrectVerb,
  flashcard: Flashcard,
  type_what_you_hear: TypeWhatYouHear,
  true_or_false: TrueOrFalse,
};

export function getMoldComponent(
  moldType: string
): ComponentType<MoldProps> | null {
  return MoldRegistry[moldType] ?? null;
}
