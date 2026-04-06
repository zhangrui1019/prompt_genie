import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import ChainEditor from '../ChainEditor';
import { promptService } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

// Mock dependencies
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  useParams: () => ({ id: undefined }), // Default to create mode
  Link: ({ children, to }: any) => <a href={to}>{children}</a>,
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@/lib/api', () => ({
  promptService: {
    getAll: vi.fn(),
    getChain: vi.fn(),
    createChain: vi.fn(),
    updateChain: vi.fn(),
    runChain: vi.fn(),
  },
}));

vi.mock('@/store/authStore', () => ({
  useAuthStore: vi.fn(),
}));

vi.mock('@/components/BackButton', () => ({
  default: ({ label }: any) => <button>{label}</button>,
}));

describe('ChainEditor', () => {
  const mockUser = { id: 1, name: 'Test User' };
  const mockPrompts = [
    { id: '1', title: 'Prompt 1', content: 'Content 1' },
    { id: '2', title: 'Prompt 2', content: 'Content 2' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (useAuthStore as any).mockImplementation((selector: any) => selector({ user: mockUser }));
    (promptService.getAll as any).mockResolvedValue(mockPrompts);
  });

  it('renders chain settings inputs', async () => {
    render(<ChainEditor />);
    
    expect(screen.getByText('Chain Settings')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('e.g. Blog Post Workflow')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Describe what this chain does...')).toBeInTheDocument();
  });

  it('allows adding a new stage', async () => {
    render(<ChainEditor />);
    
    const addStageBtn = screen.getByText((content, element) => {
        return element?.tagName.toLowerCase() === 'button' && content.includes('chains.add_stage');
    });
    
    fireEvent.click(addStageBtn);

    expect(await screen.findByText('chains.step 1')).toBeInTheDocument();
    expect(screen.getByText('Type')).toBeInTheDocument();
    expect(screen.getByText('Model')).toBeInTheDocument();
  });

  it('allows selecting a prompt for a step', async () => {
    render(<ChainEditor />);
    
    // Add a stage first
    const addStageBtn = screen.getByText((content, element) => {
        return element?.tagName.toLowerCase() === 'button' && content.includes('chains.add_stage');
    });
    fireEvent.click(addStageBtn);

    // Wait for prompts to load and dropdown to appear
    await waitFor(() => {
        expect(promptService.getAll).toHaveBeenCalled();
    });

    const selects = screen.getAllByTestId('step-prompt-select');
    const promptSelect = selects[0];
    
    fireEvent.change(promptSelect, { target: { value: '1' } });
    
    expect(promptSelect).toHaveValue('1');
  });

  it('updates model parameters when type changes', async () => {
    render(<ChainEditor />);
    
    // Add a stage
    const addStageBtn = screen.getByText((content, element) => {
        return element?.tagName.toLowerCase() === 'button' && content.includes('chains.add_stage');
    });
    fireEvent.click(addStageBtn);

    // Find Type selector
    const selects = screen.getAllByTestId('step-type-select');
    const typeSelect = selects[0];
    
    // Change to Image
    fireEvent.change(typeSelect, { target: { value: 'image' } });
    
    // Verify parameters changed (e.g. Size selector appears)
    // We check for "Square" option text or value '1024*1024'
    // Since getByDisplayValue looks for value of input, for select it looks for the displayed text of selected option usually,
    // but React Testing Library's getByDisplayValue behavior for select is to match the value attribute of the select element.
    // However, if that's failing, let's look for the option text "Square" which confirms the image params rendered.
    
    await waitFor(() => {
        expect(screen.getByText('Square')).toBeInTheDocument();
        expect(screen.getByTestId('step-params')).toHaveTextContent('Square');
    });
  });

  it('calls createChain when saving a new chain', async () => {
    render(<ChainEditor />);
    
    // Enter title
    const titleInput = screen.getByPlaceholderText('e.g. Blog Post Workflow');
    fireEvent.change(titleInput, { target: { value: 'My New Chain' } });

    // Click Save
    const saveBtn = screen.getByText('common.save');
    fireEvent.click(saveBtn);

    await waitFor(() => {
        expect(promptService.createChain).toHaveBeenCalledWith(expect.objectContaining({
            title: 'My New Chain',
            steps: []
        }));
    });
  });
});
