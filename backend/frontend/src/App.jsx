import { useState, useEffect } from 'react'
import { 
  Container, Heading, Button, Stack, Box, Text, useToast, Flex, Badge,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton,
  FormControl, FormLabel, Input, useDisclosure, ModalFooter,
  List, ListItem, Tabs, TabList, TabPanels, Tab, TabPanel, Select, Divider,
  SimpleGrid, Card, CardHeader, CardBody, CardFooter
} from '@chakra-ui/react'

function App() {
  // --- 1. ESTADOS ---
  const [pedidos, setPedidos] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [productos, setProductos] = useState([]);
  
  const [busqueda, setBusqueda] = useState(""); 
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null); 
  const [sugerencias, setSugerencias] = useState([]);
  const [lineasPedido, setLineasPedido] = useState([{ productoId: "", cantidad: "" }]);

  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevoApellido, setNuevoApellido] = useState("");
  const [nuevoTelefono, setNuevoTelefono] = useState("");

  const modalPedido = useDisclosure(); 
  const modalPaciente = useDisclosure(); 
  const toast = useToast();

  // --- 2. EFECTOS ---
  useEffect(() => { 
    fetchPedidos(); 
    fetchPacientes(); 
    fetchProductos(); 
  }, []);

  // --- 3. FUNCIONES GET ---
  const fetchProductos = async () => {
    try {
      const res = await fetch('https://pastillapp.onrender.com/api/productos/');
      const data = await res.json();
      setProductos(Array.isArray(data) ? data : (data.results || []));
    } catch (e) { console.error(e); }
  };

  const fetchPacientes = async () => {
    try {
      const res = await fetch('https://pastillapp.onrender.com/api/pacientes/'); 
      const data = await res.json();
      setPacientes(data); 
    } catch (e) { console.error(e); }
  };

  const fetchPedidos = async () => {
    try {
      const res = await fetch('https://pastillapp.onrender.com/api/ventas/pedidos/');
      const data = await res.json();
      setPedidos(data);
    } catch (e) { console.error(e); }
  };

  // --- 4. FUNCIONES DE ACTUALIZACIÓN (PATCH) ---
  const actualizarEstadoPedido = async (id, campo, valorActual) => {
    try {
      const res = await fetch(`https://pastillapp.onrender.com/api/ventas/pedidos/${id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [campo]: !valorActual }) 
      });
      if (res.ok) {
        toast({ title: `Pedido actualizado`, status: "success", duration: 2000 });
        fetchPedidos();
      }
    } catch (e) { console.error("Error al actualizar:", e); }
  };

  const actualizarPrecio = async (id, nuevoPrecio) => {
    try {
      const res = await fetch(`https://pastillapp.onrender.com/api/productos/${id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ precio_actual: nuevoPrecio })
      });
      if (res.ok) {
        toast({ title: "Precio actualizado", status: "success", duration: 2000 });
        fetchProductos();
      }
    } catch (e) { console.error(e); }
  };

  const actualizarStock = async (id, nuevoStock) => {
    try {
      const res = await fetch(`https://pastillapp.onrender.com/api/productos/${id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: parseInt(nuevoStock) })
      });
      if (res.ok) {
        toast({ title: "Stock actualizado", status: "success", duration: 2000 });
        fetchProductos();
      }
    } catch (e) { console.error(e); }
  };

  // --- 5. FUNCIONES POST ---
  const guardarPedido = async () => {
    if (!pacienteSeleccionado || lineasPedido.some(l => !l.productoId || !l.cantidad)) {
      toast({ title: "Faltan datos", status: "warning" });
      return;
    }
    const datosPedido = {
      paciente: pacienteSeleccionado.id,
      detalles: lineasPedido.map(l => ({
        producto: parseInt(l.productoId),
        cantidad: parseInt(l.cantidad)
      }))
    };
    try {
      const res = await fetch('https://pastillapp.onrender.com/api/ventas/pedidos/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosPedido)
      });
      if (res.ok) {
        fetchPedidos(); fetchProductos(); cerrarLimpiarPedido();
        toast({ title: "Venta guardada", status: "success" });
      }
    } catch (e) { console.error(e); }
  };

  const guardarPaciente = async () => {
    const datos = { nombre: nuevoNombre, apellido: nuevoApellido, telefono: nuevoTelefono };
    try {
      const res = await fetch('https://pastillapp.onrender.com/api/pacientes/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
      });
      if (res.ok) {
        fetchPacientes();
        setNuevoNombre(""); setNuevoApellido(""); setNuevoTelefono("");
        modalPaciente.onClose();
        toast({ title: "Paciente guardado", status: "success" });
      }
    } catch (e) { console.error(e); }
  };

  // --- 6. LOGICA UI ---
  const agregarFila = () => setLineasPedido([...lineasPedido, { productoId: "", cantidad: "" }]);
  const eliminarFila = (i) => setLineasPedido(lineasPedido.filter((_, idx) => idx !== i));
  const actualizarFila = (i, campo, val) => {
    const nuevas = [...lineasPedido];
    nuevas[i][campo] = val;
    setLineasPedido(nuevas);
  };
  const cerrarLimpiarPedido = () => {
    setBusqueda(""); setPacienteSeleccionado(null);
    setLineasPedido([{ productoId: "", cantidad: "" }]);
    modalPedido.onClose();
  };

  // --- 7. FILTROS ---
  const pedidosPendientesEntrega = pedidos.filter(p => !p.entregado);
  const pedidosPendientesPago = pedidos.filter(p => !p.pagado);

  return (
    <Container maxW="container.xl" py={10}>
      <Heading color="blue.600" mb={8} textAlign="center">Pastillapp 💊</Heading>

      <Tabs isFitted variant='soft-rounded' colorScheme='blue'>
        <TabList mb='1em'>
          <Tab>📝 Pedidos</Tab>
          <Tab>📜 Historial</Tab>
          <Tab>👥 Pacientes</Tab>
          <Tab>💊 Inventario</Tab>
          <Tab> Mis Gastos</Tab>
        </TabList>

        <TabPanels>
          
          {/* TAB 1: OPERACIONES (Día a día) */}
          <TabPanel>
            <Flex justify="space-between" mb={6}>
              <Text fontSize="xl" fontWeight="bold">Tareas Pendientes</Text>
              <Button colorScheme="blue" onClick={modalPedido.onOpen}>+ Nueva Venta</Button>
            </Flex>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10}>
              
              {/* PANEL A ENTREGAR */}
              <Box>
                <Card bg="blue.50" borderTop="4px solid" borderColor="blue.400" shadow="md">
                  <CardHeader pb={2}><Heading size="md" color="blue.600">📦 Por Repartir</Heading></CardHeader>
                  <CardBody>
                    {pedidosPendientesEntrega.length === 0 ? <Text italic>Todo al día ✅</Text> : (
                      <Stack spacing={4}>
                        {pedidosPendientesEntrega.map(p => (
                          <Box key={p.id} p={3} bg="white" borderRadius="md" shadow="sm">
                            <Text fontWeight="bold">{p.nombre_paciente}</Text>
                            {p.detalles.map(d => (
                              <Text key={d.id} fontSize="xs" color="gray.600">• {d.cantidad} {d.nombre_producto}</Text>
                            ))}
                            <Button size="xs" colorScheme="blue" mt={2} w="full" onClick={() => actualizarEstadoPedido(p.id, 'entregado', p.entregado)}>
                              Marcar Entregado
                            </Button>
                          </Box>
                        ))}
                      </Stack>
                    )}
                  </CardBody>
                </Card>
              </Box>

              {/* PANEL A COBRAR */}
              <Box>
                <Card bg="red.50" borderTop="4px solid" borderColor="red.400" shadow="md">
                  <CardHeader pb={2}><Heading size="md" color="red.600">💰 Por Cobrar</Heading></CardHeader>
                  <CardBody>
                    {pedidosPendientesPago.length === 0 ? <Text italic>Caja al día 💵</Text> : (
                      <Stack spacing={4}>
                        {pedidosPendientesPago.map(p => (
                          <Box key={p.id} p={3} bg="white" borderRadius="md" shadow="sm">
                            <Text fontWeight="bold">{p.nombre_paciente}</Text>
                            <Box my={1}>
                              {p.detalles.map(d => (
                                <Text key={d.id} fontSize="xs" color="gray.500">{d.cantidad}x {d.nombre_producto}</Text>
                              ))}
                            </Box>
                            <Flex justify="space-between" align="center" mt={2}>
                              <Text fontWeight="bold" color="red.600">${p.total}</Text>
                              <Button size="xs" colorScheme="red" onClick={() => actualizarEstadoPedido(p.id, 'pagado', p.pagado)}>
                                Cobrar
                              </Button>
                            </Flex>
                          </Box>
                        ))}
                      </Stack>
                    )}
                  </CardBody>
                </Card>
              </Box>
            </SimpleGrid>
          </TabPanel>

          {/* TAB 2: HISTORIAL COMPLETO */}
          <TabPanel>
            <Heading size="md" mb={4} color="gray.600">Registro General</Heading>
            <Stack spacing={3}>
              {pedidos.slice().reverse().map(p => (
                <Box key={p.id} p={4} borderWidth="1px" borderRadius="lg" bg="white" shadow="sm">
                  <Flex justify="space-between">
                    <Text fontWeight="bold" fontSize="lg">{p.nombre_paciente}</Text>
                    <Text fontSize="xs" color="gray.500">{new Date(p.fecha_venta).toLocaleString()}</Text>
                  </Flex>
                  <Text fontSize="sm" my={1}>Total: <b>${p.total}</b></Text>
                  <Flex gap={2} mt={2}>
                    <Badge colorScheme={p.pagado ? "green" : "red"}>{p.pagado ? "PAGO" : "DEBE"}</Badge>
                    <Badge colorScheme={p.entregado ? "blue" : "gray"}>{p.entregado ? "ENTREGADO" : "PENDIENTE"}</Badge>
                  </Flex>
                </Box>
              ))}
            </Stack>
          </TabPanel>

          {/* TAB 3: PACIENTES */}
          <TabPanel>
            <Flex justify="space-between" mb={6}>
              <Text fontSize="xl" fontWeight="bold">Agenda de Clientes</Text>
              <Button colorScheme="green" onClick={modalPaciente.onOpen}>+ Nuevo Paciente</Button>
            </Flex>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
              {pacientes.map(p => (
                <Box key={p.id} p={4} borderWidth="1px" borderRadius="xl" shadow="sm">
                  <Text fontWeight="bold" fontSize="md">{p.apellido}, {p.nombre}</Text>
                  <Text fontSize="sm" color="gray.600">📞 {p.telefono || "Sin teléfono"}</Text>
                </Box>
              ))}
            </SimpleGrid>
          </TabPanel>

          {/* TAB 4: INVENTARIO */}
          <TabPanel>
            <Heading fontSize="xl" mb={6}>Stock y Precios</Heading>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
              {productos.map(p => (
                <Box key={p.id} p={4} shadow="md" borderWidth="1px" borderRadius="xl" bg="white">
                  <Flex justify="space-between" align="center" mb={4}>
                    <Text fontWeight="bold" fontSize="lg" color="purple.700">{p.get_color_display}</Text>
                    <Badge colorScheme={p.stock > 10 ? "green" : "red"}>{p.stock} u.</Badge>
                  </Flex>
                  <Stack spacing={3}>
                    <Flex align="center" justify="space-between">
                      <Text fontSize="xs">Precio $</Text>
                      <Flex gap={2}>
                        <Input size="sm" w="80px" defaultValue={p.precio_actual} id={`pr-${p.id}`} />
                        <Button size="sm" onClick={() => actualizarPrecio(p.id, document.getElementById(`pr-${p.id}`).value)}>💾</Button>
                      </Flex>
                    </Flex>
                    <Flex align="center" justify="space-between">
                      <Text fontSize="xs">Stock</Text>
                      <Flex gap={2}>
                        <Input size="sm" w="80px" defaultValue={p.stock} id={`st-${p.id}`} />
                        <Button size="sm" colorScheme="green" onClick={() => actualizarStock(p.id, document.getElementById(`st-${p.id}`).value)}>📦</Button>
                      </Flex>
                    </Flex>
                  </Stack>
                </Box>
              ))}
            </SimpleGrid>
          </TabPanel>

          <TabPanel>
            <SimpleGrid>
              <Container>
                <Text>
                  Este es el container
                </Text>
              <Card>
                <CardHeader>
                  <Heading size="md">
                    Hola, este es el header
                  </Heading>
                </CardHeader>
                <CardBody>
                  <Button> boton</Button>
                </CardBody>
            
              </Card>
            </Container>
            </SimpleGrid>
            <Container>
              <Card>
            
              </Card>
            </Container>
          </TabPanel>
        </TabPanels>
      </Tabs>



      {/* --- MODALES --- */}
      <Modal isOpen={modalPedido.isOpen} onClose={cerrarLimpiarPedido} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Cargar Nueva Venta</ModalHeader>
          <ModalBody>
            <Stack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Paciente</FormLabel>
                <Input placeholder="Escribí para buscar..." value={busqueda} onChange={(e) => {
                  setBusqueda(e.target.value);
                  const filt = pacientes.filter(p => 
                    p.nombre.toLowerCase().includes(e.target.value.toLowerCase()) || 
                    p.apellido.toLowerCase().includes(e.target.value.toLowerCase()));
                  setSugerencias(filt);
                }} />
                {sugerencias.length > 0 && (
                  <List border="1px solid" borderColor="gray.200" borderRadius="md" mt={1} maxH="150px" overflowY="auto" bg="white" position="absolute" width="90%" zIndex={10}>
                    {sugerencias.map(p => (
                      <ListItem key={p.id} p={2} _hover={{ bg: "purple.50", cursor: "pointer" }} onClick={() => {
                        setBusqueda(`${p.apellido}, ${p.nombre}`);
                        setPacienteSeleccionado(p);
                        setSugerencias([]);
                      }}>{p.apellido}, {p.nombre}</ListItem>
                    ))}
                  </List>
                )}
              </FormControl>
              <Divider />
              {lineasPedido.map((linea, index) => (
                <Flex key={index} gap={2} align="center">
                  <Select placeholder="Medicamento" value={linea.productoId} onChange={(e) => actualizarFila(index, 'productoId', e.target.value)}>
                    {productos.map(p => <option key={p.id} value={p.id}>{p.get_color_display} (${p.precio_actual})</option>)}
                  </Select>
                  <Input type="number" placeholder="Cant." w="80px" value={linea.cantidad} onChange={(e) => actualizarFila(index, 'cantidad', e.target.value)} />
                  {lineasPedido.length > 1 && <Button colorScheme="red" variant="ghost" onClick={() => eliminarFila(index)}>x</Button>}
                </Flex>
              ))}
              <Button size="xs" variant="link" colorScheme="purple" onClick={agregarFila}>+ Agregar otro producto</Button>
              <Box p={4} bg="purple.50" borderRadius="md" textAlign="right">
                <Text fontWeight="bold" color="purple.800">
                  Total Final: ${lineasPedido.reduce((acc, l) => {
                    const prod = productos.find(p => p.id === parseInt(l.productoId));
                    return acc + (prod ? parseFloat(prod.precio_actual) * (parseInt(l.cantidad) || 0) : 0);
                  }, 0)}
                </Text>
              </Box>
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="purple" mr={3} onClick={guardarPedido}>Confirmar Venta</Button>
            <Button variant="ghost" onClick={cerrarLimpiarPedido}>Cerrar</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* MODAL NUEVO PACIENTE */}
      <Modal isOpen={modalPaciente.isOpen} onClose={modalPaciente.onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Nuevo Registro de Paciente</ModalHeader>
          <ModalBody>
            <Stack spacing={3}>
              <Input placeholder="Nombre" value={nuevoNombre} onChange={(e) => setNuevoNombre(e.target.value)} />
              <Input placeholder="Apellido" value={nuevoApellido} onChange={(e) => setNuevoApellido(e.target.value)} />
              <Input placeholder="Teléfono" value={nuevoTelefono} onChange={(e) => setNuevoTelefono(e.target.value)} />
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="green" mr={3} onClick={guardarPaciente}>Guardar</Button>
            <Button variant="ghost" onClick={modalPaciente.onClose}>Cancelar</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  )
}

export default App