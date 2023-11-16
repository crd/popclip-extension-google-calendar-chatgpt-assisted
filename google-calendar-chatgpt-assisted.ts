// #popclip extension for Google Calendar Event (ChatGPT-assisted)
// name: Google Calendar Event (ChatGPT-assisted)
// icon: symbol:calendar
// language: typescript
// module: true
// popclipVersion: 4226
// entitlements: [network]
// options: [{
//   identifier: apikey, 
//   label: 'API Key', 
//   type: 'string',
//   description: 'Obtain API key from https://platform.openai.com/account/api-keys'
// }]

/**
 * This PopClip extension uses the OpenAI ChatGPT API to extract event details from selected text
 * and create a Google Calendar event URL which can then be opened in the default browser.
 */

// TypeScript type definitions
interface IGenerateCalendarURLInput {
    text: string;
}

interface IOptions {
    apikey: string;
}

interface IEventDetails {
    eventName?: string;
    dates?: {
        start?: string;
        end?: string;
    };
    details?: string;
    location?: string;
}

// Constants
const API_BASE_URL: string = "https://api.openai.com/v1";
const API_MODEL: string = "gpt-3.5-turbo";
const GOOGLE_CALENDAR_BASE_URL: string = "https://calendar.google.com/calendar/render?action=TEMPLATE";
const CHATGPT_INSTRUCTION_TEMPLATE: string = `Analyze the text to extract event details such as the event name, start and end times, details, and location. Format this information in a JSON object with keys: 'eventName', 'dates.start', 'dates.end', 'details', and 'location', using 'YYYY-MM-DDTHH:mm:ss' for date formats. If no specific date is mentioned, use today's date, which is {formattedDate}. Interpret relative dates like 'tomorrow' based on this date. For unspecified durations, default to one hour. If a partial date like 'Tuesday' is mentioned, assume it as the next occurrence of that day from today.`;

const messages: Array<{ role: string; content: string }> = []; // History of previous messages

/**
 * Converts local time to Zulu time (UTC) in the format required for Google Calendar URLs.
 * 
 * @param {string} dateString - The date string to convert to Zulu time.
 * @returns {string} - The date in Zulu time format or an empty string if conversion fails.
 */
function convertToZuluTime(dateString: string): string {
    try {
        const dateObj = new Date(dateString);
        const zuluDate = dateObj.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        print(`Converting to Zulu time: ${dateString} -> ${zuluDate}`);
        return zuluDate;
    } catch (error) {
        print(`Error converting to Zulu time: ${error.message}`);
        return '';
    }
}

/**
 * Generates a Google Calendar URL based on the event details.
 * 
 * @param {IEventDetails} eventDetails - Extracted event details.
 * @returns {string} - The Google Calendar URL.
 */
function buildGoogleCalendarURL(eventDetails: IEventDetails): string {
    const eventName = eventDetails.eventName ? `&text=${encodeURIComponent(eventDetails.eventName)}` : '';
    const startDate = convertToZuluTime(eventDetails.dates?.start || "");
    const endDate = convertToZuluTime(eventDetails.dates?.end || "");
    const dateParam = startDate && endDate ? `&dates=${startDate}/${endDate}` : '';
    const details = eventDetails.details ? `&details=${encodeURIComponent(eventDetails.details)}` : '';
    const location = eventDetails.location ? `&location=${encodeURIComponent(eventDetails.location)}` : '';

    return GOOGLE_CALENDAR_BASE_URL + eventName + dateParam + details + location;
}

/**
 * Uses ChatGPT to generate a Google Calendar URL based on the input text.
 * 
 * @param {IGenerateCalendarURLInput} input - The input text selected by the user.
 * @param {IOptions} options - Options containing the API key.
 * @returns {Promise<string>} - A promise that resolves to the Google Calendar URL.
 */
async function generateCalendarURL(input: IGenerateCalendarURLInput, options: IOptions): Promise<string> {
    const openai = require("axios").create({
        baseURL: API_BASE_URL,
        headers: { Authorization: `Bearer ${options.apikey}` }
    });

    // Construct the message to instruct ChatGPT
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    const chatGptInstruction = CHATGPT_INSTRUCTION_TEMPLATE.replace("{formattedDate}", formattedDate);
    messages.push({ role: "system", content: chatGptInstruction });
    messages.push({ role: "user", content: input.text });

    try {
        const { data } = await openai.post("/chat/completions", {
            model: API_MODEL,
            messages
        });

        // Handle the API response
        messages.push(data.choices[0].message);
        const parsedResponse: IEventDetails = JSON.parse(data.choices[0].message.content);
        const calendarURL = buildGoogleCalendarURL(parsedResponse);

        print(`Generated Calendar URL: ${calendarURL}`);
        popclip.openUrl(calendarURL);
        return calendarURL;

    } catch (error) {
        // Handle specific error for a bad or missing API key
        if (error.response && error.response.status === 401) {
            throw new Error("Settings error: Incorrect or missing API key");
        }
        else {
            print(`Error generating Google Calendar URL: ${error.message}`);
        }
        throw error; // Re-throw the error for any other kind of issue
    }
}

// Exports the PopClip action
export const actions = [{
    title: "Generate Google Calendar URL",
    code: generateCalendarURL,
}];
