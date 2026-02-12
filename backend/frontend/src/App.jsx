// ... (mismos imports de Chakra UI)

function App() {
  // --- (mismos estados y funciones fetch/post/patch) ---
  // ... (mantené toda tu lógica de funciones igual, solo cambia el return abajo)

  return (
    <Box bg="gray.50" minH="100vh" py={6}> {/* Fondo sutil para que las cards resalten */}
      <Container maxW="container.xl">
        
        {/* HEADER MODERNO */}
        <Flex direction="column" align="center" mb={10}>
          <Heading 
            fontSize={{ base: "3xl", md: "5xl" }} 
            bgGradient="linear(to-r, purple.600, blue.500)" 
            bgClip="text"
            letterSpacing="tight"
          >
            Pastillapp 💊
          </Heading>
          <Text color="gray.500" fontWeight="medium">Gestión Profesional de Inventario</Text>
        </Flex>

        <Tabs isFitted variant='unstyled' colorScheme='purple'>
          <TabList bg="white" p={2} borderRadius="2xl" shadow="sm" mb={8} border="1px solid" borderColor="gray.100">
            {/* Tabs con estilo de "Píldora" */}
            <Tab _selected={{ bg: 'purple.600', color: 'white', shadow: 'md' }} borderRadius="xl" fontWeight="bold" transition="0.3s">📋 Ventas</Tab>
            <Tab _selected={{ bg: 'purple.600', color: 'white', shadow: 'md' }} borderRadius="xl" fontWeight="bold" transition="0.3s">👥 Pacientes</Tab>
            <Tab _selected={{ bg: 'purple.600', color: 'white', shadow: 'md' }} borderRadius="xl" fontWeight="bold" transition="0.3s">💊 Stock</Tab>
          </TabList>

          <TabPanels>
            {/* --- TAB 1: VENTAS (Look Dashboard) --- */}
            <TabPanel p={0}>
              <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={8}>
                
                {/* COLUMNA IZQUIERDA: HISTORIAL */}
                <Box gridColumn={{ lg: "span 2" }}>
                  <Flex justify="space-between" align="center" mb={6}>
                    <Heading size="md" color="gray.700">Historial Reciente</Heading>
                    <Button 
                      leftIcon={<span>+</span>} 
                      colorScheme="purple" 
                      borderRadius="xl" 
                      px={8} 
                      shadow="lg"
                      _hover={{ transform: 'translateY(-2px)', shadow: 'xl' }}
                      onClick={modalPedido.onOpen}
                    >
                      Nueva Venta
                    </Button>
                  </Flex>

                  <Stack spacing={4}>
                    {pedidos.map(p => (
                      <Card 
                        key={p.id} 
                        variant="outline" 
                        borderRadius="2xl" 
                        overflow="hidden"
                        transition="0.2s"
                        _hover={{ shadow: 'md', borderColor: 'purple.200' }}
                      >
                        <CardBody>
                          <Flex justify="space-between" align="center">
                            <Stack spacing={1}>
                              <Text fontWeight="bold" fontSize="lg">{p.nombre_paciente}</Text>
                              <Text fontSize="sm" color="gray.500">
                                {p.detalles.map(d => `${d.cantidad}x ${d.nombre_producto}`).join(" • ")}
                              </Text>
                            </Stack>
                            <Stack align="flex-end">
                              <Badge 
                                variant="subtle" 
                                colorScheme={p.pagado ? "green" : "orange"}
                                borderRadius="lg"
                                px={3} py={1}
                              >
                                {p.pagado ? "PAGO" : "PENDIENTE"}
                              </Badge>
                              <Text fontWeight="extrabold" fontSize="xl" color="purple.700">${p.total}</Text>
                            </Stack>
                          </Flex>
                        </CardBody>
                      </Card>
                    ))}
                  </Stack>
                </Box>

                {/* COLUMNA DERECHA: DEUDORES (Panel Flotante) */}
                <Box>
                  <Card borderRadius="2xl" border="none" shadow="2xl" bg="white" position="sticky" top="20px">
                    <CardHeader bg="red.500" borderRadius="2xl 2xl 0 0" color="white" py={4}>
                      <Heading size="sm">⚠️ CUENTAS PENDIENTES</Heading>
                    </CardHeader>
                    <CardBody>
                      {pedidosPendientes.length === 0 ? (
                        <Text color="gray.400" textAlign="center" py={10}>No hay deudas, ¡festejá! 🎉</Text>
                      ) : (
                        <Stack spacing={4}>
                          {pedidosPendientes.map(p => (
                            <Flex key={p.id} justify="space-between" align="center" p={2} borderRadius="lg" _hover={{ bg: "gray.50" }}>
                              <Box>
                                <Text fontWeight="bold" fontSize="sm">{p.nombre_paciente}</Text>
                                <Text fontSize="xs" color="red.500">Debe: ${p.total}</Text>
                              </Box>
                              <Button size="xs" colorScheme="red" borderRadius="md" onClick={() => marcarComoEntregado(p.id)}>Cobrar</Button>
                            </Flex>
                          ))}
                        </Stack>
                      )}
                    </CardBody>
                    <Divider />
                    <CardFooter bg="gray.50" borderRadius="0 0 2xl 2xl">
                      <Flex justify="space-between" w="100%" align="center">
                        <Text fontWeight="bold" color="gray.600">Total Global:</Text>
                        <Text fontWeight="black" fontSize="xl" color="red.600">
                          ${pedidosPendientes.reduce((acc, p) => acc + parseFloat(p.total), 0)}
                        </Text>
                      </Flex>
                    </CardFooter>
                  </Card>
                </Box>
              </SimpleGrid>
            </TabPanel>

            {/* TAB 3: INVENTARIO (Cards con más impacto) */}
            <TabPanel p={0}>
              <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={6}>
                {productos.map(p => (
                  <Card key={p.id} borderRadius="2xl" shadow="sm" border="1px solid" borderColor="gray.100">
                    <CardBody>
                      <Flex justify="space-between" mb={4}>
                        <Heading size="md" color="purple.800">{p.get_color_display}</Heading>
                        <Badge colorScheme={p.stock > 10 ? "green" : "red"} variant="solid" borderRadius="full" px={3}>
                          {p.stock} u.
                        </Badge>
                      </Flex>
                      
                      <Stack spacing={3}>
                        <FormControl>
                          <FormLabel fontSize="xs" color="gray.400">PRECIO DE VENTA</FormLabel>
                          <Flex gap={2}>
                            <Input type="number" defaultValue={p.precio_actual} id={`precio-${p.id}`} borderRadius="xl" focusBorderColor="purple.400" />
                            <Button colorScheme="blue" borderRadius="xl" onClick={() => actualizarPrecio(p.id, document.getElementById(`precio-${p.id}`).value)}>💾</Button>
                          </Flex>
                        </FormControl>
                        <FormControl>
                          <FormLabel fontSize="xs" color="gray.400">STOCK DISPONIBLE</FormLabel>
                          <Flex gap={2}>
                            <Input type="number" defaultValue={p.stock} id={`stock-${p.id}`} borderRadius="xl" focusBorderColor="green.400" />
                            <Button colorScheme="green" borderRadius="xl" onClick={() => actualizarStock(p.id, document.getElementById(`stock-${p.id}`).value)}>📦</Button>
                          </Flex>
                        </FormControl>
                      </Stack>
                    </CardBody>
                  </Card>
                ))}
              </SimpleGrid>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Container>
    </Box>
  );
}