import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';

/**
 * Serviço de criptografia para dados sensíveis (CPF, CNS, etc)
 * Usa AES-256 para criptografia simétrica
 */
@Injectable({
  providedIn: 'root'
})
export class EncryptionService {
  // Chave de criptografia - DEVE ser mantida em variável de ambiente em produção
  private readonly SECRET_KEY = this.getSecretKey();

  constructor() {}

  /**
   * Obtém a chave secreta das variáveis de ambiente
   * Em produção, use Firebase Remote Config ou variável de ambiente
   */
  private getSecretKey(): string {
    // TODO: Em produção, buscar de variável de ambiente
    // return environment.encryptionKey;
    
    // Por enquanto, gerar uma chave baseada em um salt fixo
    // IMPORTANTE: Alterar isso em produção!
    return 'SECSA_ENCRYPTION_KEY_2024_SECURE_V1';
  }

  /**
   * Criptografa um dado sensível usando AES-256
   * @param data Dado a ser criptografado (CPF, CNS, etc)
   * @returns String criptografada em base64
   */
  encrypt(data: string): string {
    if (!data) return '';
    
    try {
      const encrypted = CryptoJS.AES.encrypt(data, this.SECRET_KEY);
      return encrypted.toString();
    } catch (error) {
      console.error('Erro ao criptografar dados:', error);
      throw new Error('Falha ao criptografar dados sensíveis');
    }
  }

  /**
   * Descriptografa um dado sensível
   * @param encryptedData Dado criptografado
   * @returns Dado original descriptografado
   */
  decrypt(encryptedData: string): string {
    if (!encryptedData) return '';
    
    try {
      const decrypted = CryptoJS.AES.decrypt(encryptedData, this.SECRET_KEY);
      return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error('Erro ao descriptografar dados:', error);
      throw new Error('Falha ao descriptografar dados sensíveis');
    }
  }

  /**
   * Gera hash SHA-256 para busca de dados
   * Permite buscar por CPF/CNS sem armazenar em texto plano
   * @param data Dado para gerar hash
   * @returns Hash SHA-256
   */
  hash(data: string): string {
    if (!data) return '';
    
    try {
      // Normaliza o dado (remove pontuação, espaços)
      const normalized = this.normalize(data);
      return CryptoJS.SHA256(normalized).toString();
    } catch (error) {
      console.error('Erro ao gerar hash:', error);
      throw new Error('Falha ao gerar hash');
    }
  }

  /**
   * Normaliza um dado removendo caracteres especiais
   * @param data Dado a normalizar
   * @returns Dado normalizado (apenas números/letras)
   */
  private normalize(data: string): string {
    return data.replace(/[^\w]/g, '').toLowerCase();
  }

  /**
   * Criptografa CPF
   * @param cpf CPF no formato XXX.XXX.XXX-XX ou apenas números
   * @returns Objeto com CPF criptografado e hash para busca
   */
  encryptCPF(cpf: string): { encrypted: string; hash: string } {
    const normalized = this.normalize(cpf);
    
    if (normalized.length !== 11) {
      throw new Error('CPF inválido');
    }

    return {
      encrypted: this.encrypt(normalized),
      hash: this.hash(normalized)
    };
  }

  /**
   * Descriptografa CPF e formata
   * @param encryptedCpf CPF criptografado
   * @returns CPF formatado XXX.XXX.XXX-XX
   */
  decryptCPF(encryptedCpf: string): string {
    const decrypted = this.decrypt(encryptedCpf);
    return this.formatCPF(decrypted);
  }

  /**
   * Criptografa CNS (Cartão Nacional de Saúde)
   * @param cns CNS (15 dígitos)
   * @returns Objeto com CNS criptografado e hash para busca
   */
  encryptCNS(cns: string): { encrypted: string; hash: string } {
    const normalized = this.normalize(cns);
    
    if (normalized.length !== 15) {
      throw new Error('CNS inválido');
    }

    return {
      encrypted: this.encrypt(normalized),
      hash: this.hash(normalized)
    };
  }

  /**
   * Descriptografa CNS
   * @param encryptedCns CNS criptografado
   * @returns CNS original
   */
  decryptCNS(encryptedCns: string): string {
    return this.decrypt(encryptedCns);
  }

  /**
   * Formata CPF para exibição
   * @param cpf CPF sem formatação
   * @returns CPF formatado XXX.XXX.XXX-XX
   */
  private formatCPF(cpf: string): string {
    if (!cpf || cpf.length !== 11) return cpf;
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  /**
   * Valida se CPF é válido (algoritmo oficial)
   * @param cpf CPF a validar
   * @returns true se válido
   */
  validateCPF(cpf: string): boolean {
    const normalized = this.normalize(cpf);
    
    if (normalized.length !== 11) return false;
    
    // Rejeita CPFs com todos dígitos iguais
    if (/^(\d)\1{10}$/.test(normalized)) return false;

    // Validação dos dígitos verificadores
    let sum = 0;
    let remainder: number;

    // Primeiro dígito verificador
    for (let i = 1; i <= 9; i++) {
      sum += parseInt(normalized.substring(i - 1, i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(normalized.substring(9, 10))) return false;

    // Segundo dígito verificador
    sum = 0;
    for (let i = 1; i <= 10; i++) {
      sum += parseInt(normalized.substring(i - 1, i)) * (12 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(normalized.substring(10, 11))) return false;

    return true;
  }

  /**
   * Valida CNS (Cartão Nacional de Saúde)
   * @param cns CNS a validar
   * @returns true se válido
   */
  validateCNS(cns: string): boolean {
    const normalized = this.normalize(cns);
    
    if (normalized.length !== 15) return false;

    // CNS começa com 1, 2, 7, 8 ou 9
    const firstChar = normalized.charAt(0);
    if (!['1', '2', '7', '8', '9'].includes(firstChar)) return false;

    // Validação do dígito verificador
    let sum = 0;
    for (let i = 0; i < 15; i++) {
      sum += parseInt(normalized.charAt(i)) * (15 - i);
    }

    return sum % 11 === 0;
  }

  /**
   * Mascara parcialmente um CPF para exibição
   * @param cpf CPF completo
   * @returns CPF mascarado (XXX.XXX.789-01)
   */
  maskCPF(cpf: string): string {
    const formatted = this.formatCPF(this.normalize(cpf));
    if (formatted.length !== 14) return cpf;
    return `***.***${formatted.substring(7)}`;
  }

  /**
   * Mascara parcialmente um CNS para exibição
   * @param cns CNS completo
   * @returns CNS mascarado
   */
  maskCNS(cns: string): string {
    const normalized = this.normalize(cns);
    if (normalized.length !== 15) return cns;
    return `***********${normalized.substring(11)}`;
  }
}
