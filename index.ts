import * as fs from 'fs';
import {SpeechClient} from '@google-cloud/speech';

// Creates a client
const client = new SpeechClient();

const fileName = './sample.wav';

const content = fs.readFileSync(fileName).toString('base64')

async function getResponse(content, languageCode) {
  const config = {
    enableWordTimeOffsets: true,
    encoding: 'LINEAR16',
    languageCode, // 'zu-ZA' 'af-ZA', 'en-ZA'
    enableWordConfidence: true,
  };
  
  const audio = {
    content,
  };
  
  const request = {
    config: config,
    audio: audio,
  };
  
  const [operation] = await client.longRunningRecognize(request);
  const [response] = await operation.promise();
  return response
}

function log(translation) {
  const transcription = translation.results
  .map(result => result.alternatives[0].transcript)
  .join('\n');
  console.log(`Transcription: ${transcription}`);
  const result = translation.results[translation.results.length - 1];
  const wordsInfo = result.alternatives[0].words;
  // Note: The transcript within each result is separate and sequential per result.
  // However, the words list within an alternative includes all the words
  // from all the results thus far. Thus, to get all the words with speaker
  // tags, you only have to take the words list from the last result:
  wordsInfo.forEach(a =>
    console.log(` word: ${a.word}, confidence: ${a.confidence}, start: ${a.startTime.seconds}, end: ${a.endTime.seconds}`)
  );
}


const englishTranslation = await getResponse(content, 'en-ZA');
const zuluTranslation = await getResponse(content, 'zu-ZA');

log(englishTranslation);
log(zuluTranslation);