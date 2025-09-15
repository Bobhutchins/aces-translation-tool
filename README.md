# ACES Translation Tool

A comprehensive internal web application for ACES World Language Translation Services that leverages Claude Sonnet 4 for automated document translation and interpretation support.

## Features

### 🚀 Core Application Features

1. **Document Translation Interface**
   - Clean upload area for documents (PDF, Word, text files)
   - Source and target language selection from 40+ supported languages
   - Integration with Claude Sonnet 4 API (claude-3-5-sonnet-20241022)
   - Real-time translation processing with progress indicators
   - Side-by-side display of original and translated content
   - Edit functionality for staff to refine AI-generated translations

2. **Quality Control Dashboard**
   - Translation review interface for staff oversight
   - Confidence scoring for translations
   - Flagging system for content requiring human review
   - Version history and revision tracking
   - Educational terminology dictionary integration
   - Specialized vocabulary for IEPs, evaluations, and school communications

3. **Batch Processing**
   - Multiple document upload capability
   - Queue management for large translation jobs
   - Priority settings for urgent requests
   - Automated file naming and organization
   - Export options (Word, PDF, original formatting)

4. **Educational Context Optimization**
   - Custom prompts for educational document types (IEPs, report cards, parent communications)
   - Connecticut education regulation awareness
   - Cultural sensitivity checks for family communications
   - Terminology consistency across documents

5. **Internal Workflow Management**
   - Staff user authentication and role management
   - Project assignment and tracking
   - Time logging for billing purposes
   - Quality metrics and performance analytics
   - Client request integration

## Technical Requirements

- **Secure API integration** with Anthropic's Claude Sonnet 4
- **Local document processing** and storage
- **FERPA-compliant** data handling
- **Backup and audit trail** functionality
- **Integration capability** with existing ACES systems

## Claude Integration Specifications

- Uses `claude-3-5-sonnet-20241022` model
- Custom system prompts for educational translation context
- Error handling for API limitations or failures
- Token usage tracking for cost management
- Fallback procedures when AI translation needs human review

## User Interface

- Professional, utility-focused design
- Keyboard shortcuts for efficiency
- Drag-and-drop file handling
- Responsive design for various screen sizes
- Dark/light mode options for extended use

## Installation

### Prerequisites

- Node.js 18+ and npm
- MongoDB (for production)
- Anthropic API key

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd aces-translation-tool
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Environment Configuration**
   ```bash
   cd server
   cp env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   CLIENT_URL=http://localhost:3000

   # Database
   MONGODB_URI=mongodb://localhost:27017/aces-translation

   # JWT Secret
   JWT_SECRET=your-super-secret-jwt-key-here

   # Claude API Configuration
   ANTHROPIC_API_KEY=your-anthropic-api-key-here
   CLAUDE_MODEL=claude-3-5-sonnet-20241022

   # File Upload Configuration
   MAX_FILE_SIZE=50MB
   UPLOAD_PATH=./uploads
   ```

4. **Start the application**
   ```bash
   npm run dev
   ```

   This will start both the backend server (port 5000) and frontend client (port 3000).

## Usage

### Demo Credentials

- **Admin**: `admin@aces.org` / `admin123`
- **Translator**: `translator@aces.org` / `admin123`

### Key Workflows

1. **Staff uploads document** requiring translation
2. **System processes** through Claude Sonnet 4 with educational context
3. **Staff reviews and edits** automated translation
4. **Final document** is formatted and prepared for delivery
5. **Usage metrics and quality scores** are logged

## Supported Document Types

- **IEP Documents**: Individualized Education Programs with legal terminology
- **Report Cards**: Student performance reports with grade-level appropriate language
- **Parent Communications**: Family correspondence with culturally sensitive language
- **Evaluations**: Educational assessments with psychological terminology
- **General Documents**: Standard educational documents and communications
- **Legal Documents**: Official legal documents requiring precise terminology

## Supported Languages

The tool supports 40+ languages including:
- English, Spanish, Portuguese, French, Italian, German
- Russian, Chinese (Simplified & Traditional), Japanese, Korean
- Arabic, Hindi, Urdu, Vietnamese, Thai, Polish, Turkish
- Dutch, Swedish, Danish, Norwegian, Finnish, Hebrew, Greek
- And many more...

## Security & Compliance

- **FERPA Compliant**: All data handling follows FERPA guidelines
- **Secure Authentication**: JWT-based authentication with role management
- **Data Encryption**: All sensitive data is encrypted in transit and at rest
- **Audit Logging**: Comprehensive logging for compliance and debugging
- **Rate Limiting**: API rate limiting to prevent abuse
- **File Validation**: Strict file type and size validation

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh JWT token

### Translation
- `POST /api/translation/translate` - Translate text
- `POST /api/translation/batch` - Batch translate multiple texts
- `GET /api/translation/languages` - Get supported languages
- `GET /api/translation/document-types` - Get document types
- `GET /api/translation/history` - Get translation history
- `GET /api/translation/analytics` - Get translation analytics

### Documents
- `POST /api/documents/upload` - Upload document
- `POST /api/documents/translate` - Translate uploaded document
- `GET /api/documents/:id` - Get document info
- `GET /api/documents` - Get user's documents
- `DELETE /api/documents/:id` - Delete document
- `POST /api/documents/export` - Export translated document

### Users (Admin only)
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `GET /api/users/stats/overview` - Get user statistics

## Development

### Project Structure

```
aces-translation-tool/
├── server/                 # Backend Node.js application
│   ├── routes/            # API routes
│   ├── services/          # Business logic services
│   ├── middleware/        # Express middleware
│   ├── utils/            # Utility functions
│   └── uploads/          # File upload directory
├── client/               # Frontend React application
│   ├── src/
│   │   ├── components/   # Reusable React components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API service functions
│   │   ├── contexts/     # React contexts
│   │   └── utils/        # Utility functions
│   └── public/           # Static assets
└── README.md
```

### Available Scripts

- `npm run dev` - Start both server and client in development mode
- `npm run server` - Start only the backend server
- `npm run client` - Start only the frontend client
- `npm run build` - Build the client for production
- `npm run install-all` - Install dependencies for all packages

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions, please contact the ACES IT department or create an issue in the repository.

---

**ACES - Area Cooperative Educational Services**  
*Advocacy, Commitment, Excellence, Service*
