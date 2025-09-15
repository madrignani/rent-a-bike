<?php

namespace App\Exception;

class DominioException extends \RuntimeException
{
    /**
     * @var string[]
     */
    private array $problemas = [];

    /**
     * @param string $message
     * @param array $problemas
     */
    public function __construct(string $message = "", array $problemas = [])
    {
        parent::__construct($message);
        $this->problemas = $problemas;
    }

    /**
     * @return string[]
     */
    public function getProblemas(): array
    {
        return $this->problemas;
    }

    /**
     * @param string[] $problemas
     * @return DominioException
     */
    public static function comProblemas(array $problemas): DominioException
    {
        $mensagem = "Problemas encontrados: " . implode(", ", $problemas);
        return new self($mensagem, $problemas);
    }
}

?>
