# ChatGPT Google Calendar Event Extension for PopClip

This extension allows users to create Google Calendar events from text selected on their Mac by using the OpenAI ChatGPT API to extract event details and generate a calendar URL. [PopClip](https://www.popclip.app/) is a highly-extensible productivity tool for the Mac that allows the user to perform customizable actions based on selected text.

## Table of Contents

- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Development](#development)
- [Support](#support)
- [Contributing](#contributing)
- [License](#license)

## Installation

To install the ChatGPT Google Calendar Event extension:

1. Highlight the entire extension snippet code.
2. Right-click and select "Install Extension" from the PopClip menu.
   - Alternatively, save the `.popclipext` file to your system and double-click the file. PopClip will prompt you to install the extension.

## Configuration

Before using the extension you must obtain an API key from OpenAI. Here's how:

1. Visit [OpenAI API](https://platform.openai.com/signup) and sign up to receive an API key.
2. After obtaining the key, access the PopClip extension's preferences by clicking on the PopClip menu bar item, selecting the extension, and then entering the API key in the provided field.

Note: This extension uses the ChatGPT API, which is independent of the web user interface version of ChatGPT.

## Usage

To use the ChatGPT Google Calendar Event extension:

1. Select the text that includes the event details.
2. Click on the ChatGPT Google Calendar Event action button that appears in the PopClip menu.
3. The extension will parse the selected text, generate a Google Calendar event URL, and open it in your default browser.

## Development

This extension is written in TypeScript, making the code more robust and maintainable. PopClip provides certain dependencies like `axios` in its environment, so no additional installation is needed beyond the extension itself.

For additional details on developing for PopClip, refer to the [PopClip Extensions Developer Reference](https://www.popclip.app/dev/).

## Support

If you encounter any issues or have questions about the extension, visit the [PopClip Forum](https://forum.popclip.app/) for support and discussion.

## Contributing

Contributions are welcome! Please feel free to submit pull requests.

## License

This extension is distributed under the MIT License.
