import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { ingestFromExcel, upsertQuestions, upsertAnswers } from '../lib/excel/ingest';
import { withClient } from '../lib/db';

// Mock de withClient
jest.mock('../lib/db', () => ({
  withClient: jest.fn()
}));

const mockWithClient = withClient as jest.MockedFunction<typeof withClient>;

describe('Excel Ingest', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('upsertQuestions', () => {
    it('should insert questions with correct mapping', async () => {
      const mockQuery = jest.fn();
      mockWithClient.mockImplementation(async (callback) => {
        await callback({ query: mockQuery });
      });

      const questions = [
        {
          Id_dimension: 1,
          nombre_dimensión: 'PEOPLE',
          Pregunta_especifica: 'No',
          Id_pregunta: 1,
          Pregunta: 'Responsabilidad Social',
          puntos_pregunta: 4
        },
        {
          Id_dimension: 1,
          nombre_dimensión: 'PEOPLE',
          Pregunta_especifica: 'Si',
          Id_pregunta: 2,
          Pregunta: 'Lugar de Producción',
          puntos_pregunta: 4
        }
      ];

      await upsertQuestions(questions);

      expect(mockQuery).toHaveBeenCalledTimes(2);
      
      // Verificar primera pregunta (general)
      expect(mockQuery).toHaveBeenNthCalledWith(1,
        expect.stringContaining('INSERT INTO questions'),
        ['general', 'people', 'Responsabilidad Social', '1', 1, 4]
      );
      
      // Verificar segunda pregunta (producto)
      expect(mockQuery).toHaveBeenNthCalledWith(2,
        expect.stringContaining('INSERT INTO questions'),
        ['product', 'people', 'Lugar de Producción', '2', 2, 4]
      );
    });

    it('should handle empty questions array', async () => {
      const mockQuery = jest.fn();
      mockWithClient.mockImplementation(async (callback) => {
        await callback({ query: mockQuery });
      });

      await upsertQuestions([]);

      expect(mockQuery).not.toHaveBeenCalled();
    });
  });

  describe('upsertAnswers', () => {
    it('should insert answers with question mapping', async () => {
      const mockQuery = jest.fn();
      mockWithClient.mockImplementation(async (callback) => {
        await callback({ query: mockQuery });
      });

      // Mock para la búsqueda de question_id
      mockQuery.mockImplementation((sql: string) => {
        if (sql.includes('SELECT id FROM questions')) {
          return { rows: [{ id: 'question-uuid-123' }] };
        }
        return { rows: [] };
      });

      const answers = [
        {
          Id_Pregunta: 1,
          Id_Respuesta: 1,
          Respuesta: 'Certificación ética externa',
          puntos_respuesta: 4
        }
      ];

      await upsertAnswers(answers);

      expect(mockQuery).toHaveBeenCalledTimes(2); // SELECT + INSERT
      expect(mockQuery).toHaveBeenNthCalledWith(2,
        expect.stringContaining('INSERT INTO answers'),
        ['question-uuid-123', '1', 'Certificación ética externa', 4, 1]
      );
    });

    it('should handle answers without question_id', async () => {
      const mockQuery = jest.fn();
      mockWithClient.mockImplementation(async (callback) => {
        await callback({ query: mockQuery });
      });

      // Mock para la búsqueda de question_id (no encontrada)
      mockQuery.mockImplementation((sql: string) => {
        if (sql.includes('SELECT id FROM questions')) {
          return { rows: [] };
        }
        return { rows: [] };
      });

      const answers = [
        {
          Id_Pregunta: 0, // Sin pregunta asociada
          Id_Respuesta: 1,
          Respuesta: 'Respuesta general',
          puntos_respuesta: 2
        }
      ];

      await upsertAnswers(answers);

      expect(mockQuery).toHaveBeenCalledTimes(1); // Solo INSERT
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO answers'),
        [null, '1', 'Respuesta general', 2, 1]
      );
    });
  });

  describe('ingestFromExcel', () => {
    it('should throw error for missing Excel path', async () => {
      await expect(ingestFromExcel('')).rejects.toThrow('Missing Excel path');
    });

    it('should process Excel file successfully', async () => {
      // Mock XLSX
      const mockXLSX = {
        readFile: jest.fn().mockReturnValue({
          SheetNames: ['Dimensiones', 'Preguntas completas', 'Preguntas especificas', 'Respuestas completas'],
          Sheets: {
            'Dimensiones': {},
            'Preguntas completas': {},
            'Preguntas especificas': {},
            'Respuestas completas': {}
          }
        }),
        utils: {
          sheet_to_json: jest.fn().mockReturnValue([])
        }
      };

      // Mock XLSX module
      jest.doMock('xlsx', () => mockXLSX);

      const mockQuery = jest.fn();
      mockWithClient.mockImplementation(async (callback) => {
        await callback({ query: mockQuery });
      });

      // Re-import after mocking
      const { ingestFromExcel: ingestFromExcelMocked } = await import('../lib/excel/ingest');
      
      await ingestFromExcelMocked('test.xlsx');

      expect(mockXLSX.readFile).toHaveBeenCalledWith('test.xlsx');
    });
  });

  describe('Category mapping', () => {
    it('should map Excel categories correctly', () => {
      // Test the mapping logic indirectly through upsertQuestions
      const mockQuery = jest.fn();
      mockWithClient.mockImplementation(async (callback) => {
        await callback({ query: mockQuery });
      });

      const questions = [
        {
          Id_dimension: 1,
          nombre_dimensión: 'PEOPLE',
          Pregunta_especifica: 'No',
          Id_pregunta: 1,
          Pregunta: 'Test',
          puntos_pregunta: 4
        },
        {
          Id_dimension: 2,
          nombre_dimensión: 'PLANET',
          Pregunta_especifica: 'No',
          Id_pregunta: 2,
          Pregunta: 'Test',
          puntos_pregunta: 4
        },
        {
          Id_dimension: 3,
          nombre_dimensión: 'MATERIALS ', // Con espacio extra
          Pregunta_especifica: 'No',
          Id_pregunta: 3,
          Pregunta: 'Test',
          puntos_pregunta: 4
        },
        {
          Id_dimension: 4,
          nombre_dimensión: ' CIRCULARITY', // Con espacio al inicio
          Pregunta_especifica: 'No',
          Id_pregunta: 4,
          Pregunta: 'Test',
          puntos_pregunta: 4
        }
      ];

      upsertQuestions(questions);

      expect(mockQuery).toHaveBeenCalledTimes(4);
      expect(mockQuery).toHaveBeenNthCalledWith(1, expect.anything(), ['general', 'people', 'Test', '1', 1, 4]);
      expect(mockQuery).toHaveBeenNthCalledWith(2, expect.anything(), ['general', 'planet', 'Test', '2', 2, 4]);
      expect(mockQuery).toHaveBeenNthCalledWith(3, expect.anything(), ['general', 'materials', 'Test', '3', 3, 4]);
      expect(mockQuery).toHaveBeenNthCalledWith(4, expect.anything(), ['general', 'circularity', 'Test', '4', 4, 4]);
    });
  });

  describe('Scope mapping', () => {
    it('should map scope correctly based on Pregunta_especifica', () => {
      const mockQuery = jest.fn();
      mockWithClient.mockImplementation(async (callback) => {
        await callback({ query: mockQuery });
      });

      const questions = [
        {
          Id_dimension: 1,
          nombre_dimensión: 'PEOPLE',
          Pregunta_especifica: 'No', // General
          Id_pregunta: 1,
          Pregunta: 'Test General',
          puntos_pregunta: 4
        },
        {
          Id_dimension: 1,
          nombre_dimensión: 'PEOPLE',
          Pregunta_especifica: 'Si', // Producto
          Id_pregunta: 2,
          Pregunta: 'Test Producto',
          puntos_pregunta: 4
        }
      ];

      upsertQuestions(questions);

      expect(mockQuery).toHaveBeenCalledTimes(2);
      expect(mockQuery).toHaveBeenNthCalledWith(1, expect.anything(), ['general', 'people', 'Test General', '1', 1, 4]);
      expect(mockQuery).toHaveBeenNthCalledWith(2, expect.anything(), ['product', 'people', 'Test Producto', '2', 2, 4]);
    });
  });
});

