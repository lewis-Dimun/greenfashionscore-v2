import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ProductWizardPage from '../app/product/new/page';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn()
  })
}));

// Mock the questions service
jest.mock('../lib/survey/questions-service', () => ({
  getProductQuestionsByCategory: jest.fn().mockResolvedValue([
    {
      id: 'product_q1',
      text: '¿Qué materiales utiliza en este producto?',
      answers: [
        { id: 'product_q1_a1', text: 'Materiales orgánicos', numeric_value: 5 },
        { id: 'product_q1_a2', text: 'Materiales reciclados', numeric_value: 3 },
        { id: 'product_q1_a3', text: 'Materiales convencionales', numeric_value: 1 }
      ]
    }
  ]),
  getFallbackQuestions: jest.fn().mockReturnValue({
    people: [
      {
        id: 'fallback_q1',
        text: 'Fallback question',
        answers: [
          { id: 'fallback_a1', text: 'Fallback answer', numeric_value: 2 }
        ]
      }
    ]
  })
}));

// Mock the config
jest.mock('../lib/config', () => ({
  scoringEndpointPath: () => '/api/scoring',
  FUNCTIONS_HEADERS: { 'Content-Type': 'application/json' }
}));

// Mock fetch for API calls
const mockApiResponse = {
  ok: true,
  json: async () => ({ hasGeneralSurvey: true })
};

describe('Product Wizard', () => {
  beforeEach(() => {
    global.fetch = jest.fn(() => Promise.resolve(mockApiResponse as any));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });
  it('should render product selector initially', () => {
    render(<ProductWizardPage />);
    
    expect(screen.getByText('Encuesta por Producto')).toBeInTheDocument();
    expect(screen.getByText('Selecciona el tipo de producto')).toBeInTheDocument();
    
    // Check that all product types are rendered
    expect(screen.getByText('Jersey')).toBeInTheDocument();
    expect(screen.getByText('Pantalón')).toBeInTheDocument();
    expect(screen.getByText('Polo')).toBeInTheDocument();
    expect(screen.getByText('Vestido')).toBeInTheDocument();
    expect(screen.getByText('Bolso')).toBeInTheDocument();
    expect(screen.getByText('Calzado')).toBeInTheDocument();
    expect(screen.getByText('Camisa')).toBeInTheDocument();
    expect(screen.getByText('Camiseta')).toBeInTheDocument();
    expect(screen.getByText('Falda')).toBeInTheDocument();
  });

  it('should navigate to survey when product is selected', async () => {
    render(<ProductWizardPage />);
    
    const jerseyButton = screen.getByText('Jersey').closest('button');
    expect(jerseyButton).toBeInTheDocument();
    
    fireEvent.click(jerseyButton!);
    
    await waitFor(() => {
      expect(screen.getByText('Encuesta: Jersey')).toBeInTheDocument();
    });
  });

  it('should render survey questions after product selection', async () => {
    render(<ProductWizardPage />);
    
    const jerseyButton = screen.getByText('Jersey').closest('button');
    fireEvent.click(jerseyButton!);
    
    await waitFor(() => {
      expect(screen.getByText('¿Qué materiales utiliza en este producto?')).toBeInTheDocument();
      expect(screen.getByText('Materiales orgánicos')).toBeInTheDocument();
      expect(screen.getByText('Materiales reciclados')).toBeInTheDocument();
      expect(screen.getByText('Materiales convencionales')).toBeInTheDocument();
    });
  });

  it('should allow changing product selection', async () => {
    render(<ProductWizardPage />);
    
    // Select jersey
    const jerseyButton = screen.getByText('Jersey').closest('button');
    fireEvent.click(jerseyButton!);
    
    await waitFor(() => {
      expect(screen.getByText('Encuesta: Jersey')).toBeInTheDocument();
    });
    
    // Click change product button
    const changeProductButton = screen.getByText('← Cambiar producto');
    fireEvent.click(changeProductButton);
    
    await waitFor(() => {
      expect(screen.getByText('Encuesta por Producto')).toBeInTheDocument();
    });
  });

  it('should handle answer selection', async () => {
    render(<ProductWizardPage />);
    
    const jerseyButton = screen.getByText('Jersey').closest('button');
    fireEvent.click(jerseyButton!);
    
    await waitFor(() => {
      const organicOption = screen.getByLabelText(/Materiales orgánicos/);
      fireEvent.click(organicOption);
      expect(organicOption).toBeChecked();
    });
  });

  it('should enable submit button when all questions are answered', async () => {
    render(<ProductWizardPage />);
    
    const jerseyButton = screen.getByText('Jersey').closest('button');
    fireEvent.click(jerseyButton!);
    
    await waitFor(() => {
      const organicOption = screen.getByLabelText(/Materiales orgánicos/);
      fireEvent.click(organicOption);
      
      const submitButton = screen.getByText('Enviar encuesta');
      expect(submitButton).not.toBeDisabled();
    });
  });

  it('should show loading state while fetching questions', async () => {
    // Mock a delayed response
    const { getProductQuestionsByCategory } = await import('../lib/survey/questions-service');
    getProductQuestionsByCategory.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve([]), 100))
    );
    
    render(<ProductWizardPage />);
    
    const jerseyButton = screen.getByText('Jersey').closest('button');
    fireEvent.click(jerseyButton!);
    
    expect(screen.getByText('Cargando preguntas...')).toBeInTheDocument();
  });

  it('should handle fallback questions when DB fails', async () => {
    const { getProductQuestionsByCategory } = await import('../lib/survey/questions-service');
    getProductQuestionsByCategory.mockRejectedValue(new Error('DB Error'));
    
    render(<ProductWizardPage />);
    
    const jerseyButton = screen.getByText('Jersey').closest('button');
    fireEvent.click(jerseyButton!);
    
    await waitFor(() => {
      expect(screen.getByText('Fallback question')).toBeInTheDocument();
    });
  });

  it('should be accessible with keyboard navigation', async () => {
    render(<ProductWizardPage />);
    
    // Tab through product options
    const firstProduct = screen.getByText('Jersey').closest('button');
    firstProduct?.focus();
    expect(firstProduct).toHaveFocus();
    
    // Enter should select the product
    fireEvent.keyDown(firstProduct!, { key: 'Enter' });
    
    await waitFor(() => {
      expect(screen.getByText('Encuesta: Jersey')).toBeInTheDocument();
    });
  });

  it('should have proper ARIA labels and roles', () => {
    render(<ProductWizardPage />);
    
    // Check main heading
    expect(screen.getByRole('heading', { name: 'Encuesta por Producto' })).toBeInTheDocument();
    
    // Check product buttons are accessible
    const productButtons = screen.getAllByRole('button');
    expect(productButtons.length).toBeGreaterThan(0);
    
    // Check back link
    expect(screen.getByText('← Volver al dashboard')).toBeInTheDocument();
  });
});

