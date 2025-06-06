/**
 * App.tsx
 *
 * Main part. Sets up the Fluent UI provider and
 * renders the core application components. Handles the main layout and
 * styling of the application interface.
 */
/*! Copyright Jon Verrier 2025 */
import React from 'react';
import { EAssistantPersonality } from '../import/AssistantChatApiTypes';
export interface IAppProps {
    personality: EAssistantPersonality;
    sessionId: string;
    email: string;
    onLogout: () => Promise<void>;
}
export declare const App: (props: IAppProps) => React.JSX.Element;
//# sourceMappingURL=App.d.ts.map