<?php

namespace App\Config;

use PDO;
use PDOException;

class Conexao {
    public static function conectar(): PDO {
        try {
            return new PDO(
                'mysql:host=localhost;dbname=rent_a_bike;charset=utf8',
                'root',
                '', 
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                ]
            );
        } catch (PDOException $e) {
            http_response_code(500);
            die('Erro ao conectar no banco: ' . $e->getMessage());
        }
    }
}

?>