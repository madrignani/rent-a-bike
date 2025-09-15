USE rent_a_bike;

INSERT INTO seguro (numero) VALUES
('001'), ('002'), ('003'), ('004'), ('005'),
('006'), ('007'), ('008'), ('009'), ('010');

INSERT INTO fabricante (descricao) VALUES
('Caloi'), ('Monark'), ('Sense'), ('Trek'), ('Mercedes-Benz');

INSERT INTO funcionario (nome, cpf, senha_hash, salt, cargo) VALUES
('João da Silva', '12345678997', 'd9829453301891f73de7b27008b9868a37d64a736731bbada95bb9adc9db50ae396592897ae4889396563aa51c8d6c4898d2ae1ba6d9d42e493f5c157e9bafba', '38a8aaa4c01333c930757515fa4ec168', 'GERENTE'),
('Maria Aparecida', '12345678998', '7813f5d1342dd25180f0f823a7ee6e80c6e1f6bc310d65ec0ba90cd0b46382da91fc033041c9a88f7c031203bd0572cca7d8a16e37aca6a9de54311c74d82035', '14c867fc27c5ed1988005df0064e284c', 'ATENDENTE'),
('Glaucio Madeira', '12345678999', '5942e028a2977b2c5a500235f18cb33b78e4fe36c902fbe0a9180f064cceca8333144396a2b6a6ed0b0507588d3ce8e74b8fd9b1a879ffa124bce72ccc627c61', '3a8b75d7cfa2f4e2dcbf49f8d8c3731a', 'MECANICO'),
('Sandro da TI', '12345678996', '7788bbfbf62fbf827936ecaa53032b472e529d8c39ceda5667ed6c69cb9f5344324c45efea5989893f0e326717ba510c8e59e9bef266acc705870213d87f00f5', '5332e5b437f7003a04592974c44d0580', 'GERENTE');

INSERT INTO cliente (nome, cpf, telefone, email, endereco, foto_url, data_nascimento) VALUES
('Edsger Dijkstra', '12345678900', '11999990000', 'dijkstra@email.com', 'Rua Lógica, 42', 'https://wiki.inf.ufpr.br/computacao/lib/exe/fetch.php?w=250&tok=7f0c7b&media=e:dijkstra3.jpg', '1930-05-11'),
('Linus Torvalds', '12345678901', '21999990001', 'torvalds@email.com', 'Rua Finlância, 123', 'https://antlia.com.br/wp-content/uploads/2023/08/Linus.jpg', '1969-07-14'),
('Alan Turing', '12345678902', '31999990002', 'turing@email.com', 'Av. Islâmica, 500', 'https://ichef.bbci.co.uk/ace/standard/976/cpsprodpb/AB6D/production/_130858834_capture.jpg', '1912-01-01'),
('Grace Hopper', '12345678903', '41999990003', 'hooper@email.com', 'Rua dos Barrosos, 10', 'https://castle.eiu.edu/wow/hopteach.jpg', '1906-03-20'),
('Tim Berners-Lee', '12345678904', '51999990004', 'tim@email.com', 'Av. Japão, 88', 'https://upload.wikimedia.org/wikipedia/commons/4/4e/Sir_Tim_Berners-Lee_%28cropped%29.jpg', '1955-09-13'),
('Margaret Hamilton', '12345678905', '61999990005', 'hamilton@email.com', 'Rua Madrid, 7', 'https://blogdaengenharia.com/wp-content/uploads/2021/05/Margaret_Hamilton_1989.jpg', '1936-03-30'),
('Donald Knuth', '12345678906', '71999990006', 'knuth@email.com', 'Rua das Flores, 32', 'https://ieeecs-media.computer.org/wp-media/2018/03/11020301/donald-knuth-e1523412218270.jpg', '1938-11-12'),
('John von Neumann', '12345678907', '81999990007', 'neumann@email.com', 'Av. Atlântica, 400', 'https://upload.wikimedia.org/wikipedia/commons/d/d6/JohnvonNeumann-LosAlamos.jpg', '1903-06-15'),
('Guido van Rossum', '12345678908', '91999990008', 'guido@email.com', 'Hollywood Blvd, 50', 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Guido_van_Rossum_OSCON_2006.jpg/960px-Guido_van_Rossum_OSCON_2006.jpg', '1956-06-01'),
('Ada Lovelace', '12345678909', '99999999999', 'ada@email.com', 'Rua dos Algoritmos, 9', 'https://upload.wikimedia.org/wikipedia/commons/b/ba/Ada_Lovelace_in_1852.jpg', '1815-12-10');

INSERT INTO item (modelo, descricao, valor_hora, fabricante_codigo) VALUES
('BikeForce AXS', 'E-bike de luxo', 350.00, 5),
('100', 'Bike urbana simples', 40.00, 1),
('Marlin 5', 'Bike MTB básica', 30.00, 4),
('Urban', 'Bike para cidade', 25.00, 3),
('Clássica', 'Bike retrô', 18.00, 2),
('Dual Sport', 'Bike Híbrida para trilhas', 120.00, 3),
('Elite', 'Mountain bike de performance', 150.00, 3),
('Impact', 'Bike de Downhill', 75.00, 3),
('Sport', 'Bike Modelo intermediário', 35.00, 2),
('E-Bike Pro', 'E-bike de alta potência', 180.00, 5);

INSERT INTO bicicleta (codigo, seguro_numero) VALUES
(1, '001'), (2, '002'), (3, '003'), (4, '004'), (5, '005'),
(6, '006'), (7, '007'), (8, '008'), (9, '009'), (10, '010');

INSERT INTO item (modelo, descricao, valor_hora, fabricante_codigo) VALUES
('Squeeze Neon', 'Garrafa térmica 500ml', 3.00, 1),
('Squeeze Brabus', 'Suporte para squeeze universal', 1.00, 2),
('Squeeze Red', 'Squeeze com isolamento duplo', 7.20, 1),
('Helmet Padrão', 'Capacete Tamanho M', 5.00, 3),
('Helmet Monster', 'Capacete Colorido G', 3.00, 4),
('LED A1', 'Farolete alta luminosidade', 4.50, 3),
('Universal Vermelho', 'Pisca alerta traseiro', 3.20, 4),
('Gel 2.0', 'Acolchoamento em gel para selim', 4.10, 2),
('Reflect Max', 'Par de refletores', 2.80, 1),
('Refletor Duo', 'Refletor de quadro', 2.90, 1),
('Universal Lock', 'Cadeado de segurança reforçada', 2.50, 2),
('Alarm', 'Alarme com sensor de movimento', 5.50, 3),
('Power 3.0', 'Bateria para bike 200W', 30.00, 5),
('Power 4.0', 'Bateria para bike 500W', 40.00, 5),
('Power 5.0', 'Bateria para bike 700W', 50.00, 5);

INSERT INTO equipamento (codigo) VALUES
(11), (12), (13), (14), (15),
(16), (17), (18), (19), (20),
(21), (22), (23), (24), (25);