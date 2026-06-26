export interface FunctionParameter {
  type: string
  description: string
  enum?: string[]
  properties?: Record<string, FunctionParameter>
  required?: string[]
  items?: FunctionParameter
}

export interface FunctionSchema {
  name: string
  description: string
  parameters?: FunctionParameter
}

export const generalTools: FunctionSchema[] = [
  {
    name: 'getCurrentTime',
    description: 'Get the current date and time',
    parameters: {
      type: 'OBJECT',
      description: 'No parameters needed',
      properties: {},
    },
  },
  {
    name: 'getSystemStatus',
    description: 'Get the current system status including memory, CPU, and uptime',
    parameters: {
      type: 'OBJECT',
      description: 'No parameters needed',
      properties: {},
    },
  },
]

export const cameraTools: FunctionSchema[] = [
  {
    name: 'openCamera',
    description: 'CRITICAL: You MUST call this tool first before answering any camera/vision question. You CANNOT see anything without calling this — the camera is not active until this runs. Use for any request about seeing, looking, checking, or opening the camera.',
    parameters: {
      type: 'OBJECT',
      description: 'No parameters needed',
      properties: {},
    },
  },
  {
    name: 'captureCameraFrame',
    description: 'Capture a single frame from the camera',
    parameters: {
      type: 'OBJECT',
      description: 'No parameters needed',
      properties: {},
    },
  },
  {
    name: 'analyzeCameraImage',
    description: 'Analyze a camera image with a specific question. Use this when the user asks what something is or wants details about what is visible.',
    parameters: {
      type: 'OBJECT',
      description: 'Parameters for image analysis',
      properties: {
        imageBase64: {
          type: 'STRING',
          description: 'The base64 encoded image data',
        },
        question: {
          type: 'STRING',
          description: 'The question to ask about the image',
        },
      },
      required: ['imageBase64', 'question'],
    },
  },
  {
    name: 'explainVisibleObject',
    description: 'Describe everything visible in the camera image. Use this when the user asks "what do you see" or "explain what is there" — it identifies and explains all objects.',
    parameters: {
      type: 'OBJECT',
      description: 'Parameters for object explanation',
      properties: {
        imageBase64: {
          type: 'STRING',
          description: 'The base64 encoded image data',
        },
      },
      required: ['imageBase64'],
    },
  },
  {
    name: 'readDocumentFromCamera',
    description: 'Read and extract text from a document visible in the camera frame',
    parameters: {
      type: 'OBJECT',
      description: 'Parameters for document reading',
      properties: {
        imageBase64: {
          type: 'STRING',
          description: 'The base64 encoded image data',
        },
      },
      required: ['imageBase64'],
    },
  },
]

export const gmailTools: FunctionSchema[] = [
  {
    name: 'getTodayEmailCount',
    description: 'Get the number of emails received today',
    parameters: {
      type: 'OBJECT',
      description: 'No parameters needed',
      properties: {},
    },
  },
  {
    name: 'getUnreadEmailCount',
    description: 'Get the number of unread emails in the inbox',
    parameters: {
      type: 'OBJECT',
      description: 'No parameters needed',
      properties: {},
    },
  },
  {
    name: 'getLatestEmails',
    description: 'Get the most recent emails from the inbox',
    parameters: {
      type: 'OBJECT',
      description: 'Parameters for fetching emails',
      properties: {
        limit: {
          type: 'NUMBER',
          description: 'Number of emails to fetch (default 5)',
        },
      },
      required: [],
    },
  },
  {
    name: 'searchEmails',
    description: 'Search emails by query string',
    parameters: {
      type: 'OBJECT',
      description: 'Parameters for email search',
      properties: {
        query: {
          type: 'STRING',
          description: 'The search query to filter emails',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'summarizeTodayEmails',
    description: 'Get a summary of all emails received today',
    parameters: {
      type: 'OBJECT',
      description: 'No parameters needed',
      properties: {},
    },
  },
]

export const telegramTools: FunctionSchema[] = [
  {
    name: 'sendTelegramMessage',
    description: 'Send a message to the configured Telegram chat. Always ask user confirmation before sending.',
    parameters: {
      type: 'OBJECT',
      description: 'Parameters for sending a message',
      properties: {
        message: {
          type: 'STRING',
          description: 'The message text to send',
        },
      },
      required: ['message'],
    },
  },
  {
    name: 'sendTodayReportToTelegram',
    description: 'Send a daily summary report to the configured Telegram chat. Always ask user confirmation before sending.',
    parameters: {
      type: 'OBJECT',
      description: 'No parameters needed',
      properties: {},
    },
  },
]

export const googleSearchTools: FunctionSchema[] = [
  {
    name: 'openGoogleSearch',
    description: 'Open Google Search in the browser for a given query',
    parameters: {
      type: 'OBJECT',
      description: 'Parameters for search',
      properties: {
        query: {
          type: 'STRING',
          description: 'The search query',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'openYouTubeSearch',
    description: 'Open YouTube Search in the browser for a given query',
    parameters: {
      type: 'OBJECT',
      description: 'Parameters for search',
      properties: {
        query: {
          type: 'STRING',
          description: 'The search query',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'webResearchAnswer',
    description: 'Perform a web research to answer a question. Use this when the user asks for current information, news, or facts you may not know.',
    parameters: {
      type: 'OBJECT',
      description: 'Parameters for research',
      properties: {
        query: {
          type: 'STRING',
          description: 'The research question or topic',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'openWebsite',
    description: 'Open a specific website URL in the browser',
    parameters: {
      type: 'OBJECT',
      description: 'Parameters for opening a website',
      properties: {
        url: {
          type: 'STRING',
          description: 'The full URL of the website to open',
        },
      },
      required: ['url'],
    },
  },
]

export const erpTools: FunctionSchema[] = [
  {
    name: 'getErpDashboardSummary',
    description: 'Get a summary of the ERP dashboard including leads, conversions, and performance',
    parameters: {
      type: 'OBJECT',
      description: 'No parameters needed',
      properties: {},
    },
  },
  {
    name: 'getTodayLeads',
    description: 'Get all leads created today from the ERP system',
    parameters: {
      type: 'OBJECT',
      description: 'No parameters needed',
      properties: {},
    },
  },
  {
    name: 'getPendingLeads',
    description: 'Get all pending/unresolved leads from the ERP system',
    parameters: {
      type: 'OBJECT',
      description: 'No parameters needed',
      properties: {},
    },
  },
  {
    name: 'getConvertedLeads',
    description: 'Get all converted/won leads from the ERP system',
    parameters: {
      type: 'OBJECT',
      description: 'No parameters needed',
      properties: {},
    },
  },
  {
    name: 'searchErpLeads',
    description: 'Search for leads in the ERP system by query',
    parameters: {
      type: 'OBJECT',
      description: 'Parameters for lead search',
      properties: {
        query: {
          type: 'STRING',
          description: 'The search query to filter leads',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'openErpPage',
    description: 'Open a specific page in the ERP system',
    parameters: {
      type: 'OBJECT',
      description: 'Parameters for opening an ERP page',
      properties: {
        pageName: {
          type: 'STRING',
          description: 'The name of the ERP page to open (e.g. dashboard, leads, reports)',
        },
      },
      required: ['pageName'],
    },
  },
]

export const systemTools: FunctionSchema[] = [
  {
    name: 'openVSCode',
    description: 'Open Visual Studio Code editor',
    parameters: {
      type: 'OBJECT',
      description: 'No parameters needed',
      properties: {},
    },
  },
  {
    name: 'openProjectFolder',
    description: 'Open the current project folder in the file manager',
    parameters: {
      type: 'OBJECT',
      description: 'No parameters needed',
      properties: {},
    },
  },
  {
    name: 'startLocalServer',
    description: 'Start the local development server',
    parameters: {
      type: 'OBJECT',
      description: 'No parameters needed',
      properties: {},
    },
  },
  {
    name: 'openTerminal',
    description: 'Open a new terminal window',
    parameters: {
      type: 'OBJECT',
      description: 'No parameters needed',
      properties: {},
    },
  },
]

export const allFunctionSchemas: FunctionSchema[] = [
  ...generalTools,
  ...cameraTools,
  ...gmailTools,
  ...telegramTools,
  ...googleSearchTools,
  ...erpTools,
  ...systemTools,
]

export function buildToolsDeclaration(): { functionDeclarations: { name: string; description: string; parameters?: Record<string, unknown> }[] }[] {
  return [
    {
      functionDeclarations: allFunctionSchemas as unknown as { name: string; description: string; parameters?: Record<string, unknown> }[],
    },
  ]
}
