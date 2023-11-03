// #popclip extension for Google Calendar Event (ChatGPT-assisted)
// name: Google Calendar Event (ChatGPT-assisted)
// icon: symbol:calendar
// language: typescript
// module: true
// xpopclipVersion: 1004226
// entitlements: [network]
// options: [{
//   identifier: apikey, 
//   label: 'API Key', 
//   type: 'string',
//   description: 'Obtain API key from https://platform.openai.com/account/api-keys'
// }]

// TypeScript types definitions
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
const CHATGPT_INSTRUCTION: string = "Extract event details from the text: name, start/end times, location, and description. Return a JSON with keys: 'eventName', 'dates.start', 'dates.end', 'details', 'location'. Use the 'YYYY-MM-DDTHH:mm:ss' format for dates. The start and end times must be retrieved from the provided text wherever possible. If no duration, assume one hour. Assume the current date is ${formattedDate}. If no date is mentioned, assume today. If only a day is mentioned, consider the next occurrence. If a year isn't mentioned, use the year of the next occurrence of that date.";

const messages: Array<{ role: string; content: string }> = []; // History of previous messages

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

async function generateCalendarURL(input: IGenerateCalendarURLInput, options: IOptions): Promise<string> {
    const openai = require("axios").create({
        baseURL: API_BASE_URL,
        headers: { Authorization: `Bearer ${options.apikey}` }
    });

    // Construct the message to instruct ChatGPT
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    messages.push({
        role: "system",
        content: CHATGPT_INSTRUCTION.replace("${formattedDate}", formattedDate)
    });
    messages.push({ role: "user", content: input.text });

    try {
        const { data } = await openai.post("/chat/completions", {
            model: API_MODEL,
            messages
        });

        messages.push(data.choices[0].message);
        const parsedResponse: IEventDetails = JSON.parse(data.choices[0].message.content);

        // Build Google Calendar URL with event details
        const eventName = parsedResponse.eventName ? `&text=${encodeURIComponent(parsedResponse.eventName)}` : '';
        const startDate = convertToZuluTime(parsedResponse.dates?.start || "");
        const endDate = convertToZuluTime(parsedResponse.dates?.end || "");
        const dateParam = startDate && endDate ? `&dates=${startDate}/${endDate}` : '';
        const details = parsedResponse.details ? `&details=${encodeURIComponent(parsedResponse.details)}` : '';
        const location = parsedResponse.location ? `&location=${encodeURIComponent(parsedResponse.location)}` : '';

        const calendarURL = GOOGLE_CALENDAR_BASE_URL + eventName + dateParam + details + location;
        print(`Generated Calendar URL: ${calendarURL}`);
        popclip.openUrl(calendarURL);
        return calendarURL;

    } catch (error) {
        if (error.response && error.response.status === 401) {
            throw new Error("Settings error: Incorrect or missing API key");
        }
        else {
            print(`Error generating Google Calendar URL: ${error.message}`);
        }
        
        return '';
    }
}

// Exports
exports.actions = [{
    title: "Generate Google Calendar URL",
    code: generateCalendarURL,
}];
