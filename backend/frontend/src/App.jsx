import { useState, useEffect } from 'react'
import { 
  Container, Heading, Button, Stack, Box, Text, useToast, Flex, Badge,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton,
  FormControl, FormLabel, Input, useDisclosure, ModalFooter,
  List, ListItem, Tabs, TabList, TabPanels, Tab, TabPanel, Select, Divider,
  SimpleGrid, Card, CardHeader, CardBody, CardFooter, RadioGroup, Radio
} from '@chakra-ui/react'

function App() {
  // --- 1. ESTADOS Y AUTENTICACIÓN ---
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [pedidos, setPedidos] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [gastos, setGastos] = useState([]); 
  
  const [busqueda, setBusqueda] = useState(""); 
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null); 
  const [sugerencias, setSugerencias] = useState([]);
  const [lineasPedido, setLineasPedido] = useState([{ productoId: "", cantidad: "" }]);

  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevoApellido, setNuevoApellido] = useState("");
  const [nuevoTelefono, setNuevoTelefono] = useState("");
  
  // Nuevo estado para nuevo gasto
  const [nuevoGasto, setNuevoGasto] = useState({ descripcion: "", monto: "", tipo: "EGRESO" });

  const modalPedido = useDisclosure(); 
  const modalPaciente = useDisclosure(); 
  const modalGasto = useDisclosure();
  const toast = useToast();

  // --- 2. FUNCION AUTH FETCH (La "Aduana") ---
  const authFetch = async (url, options = {}) => {
    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    const res = await fetch(url, { ...options, headers });
    if (res.status === 401) { 
      setToken(null); 
      localStorage.removeItem('token'); 
      toast({ title: "Sesión expirada, inicia sesión de nuevo", status: "error" });
      throw new Error("No autorizado");
    }
    return res;
  };

  const handleLogin = async () => {
    try {
      const res = await fetch('https://pastillapp.onrender.com/api/token/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (res.ok) {
        const data = await res.json();
        setToken(data.access);
        localStorage.setItem('token', data.access);
        toast({ title: "Bienvenido", status: "success" });
      } else {
        toast({ title: "Usuario o contraseña incorrectos", status: "error" });
      }
    } catch (e) { console.error(e); }
  };

  // --- 3. EFECTOS ---
  useEffect(() => { 
    if (token) {
      fetchPedidos(); fetchPacientes(); fetchProductos(); fetchGastos();
    }
  }, [token]);

  // --- 4. FUNCIONES GET ---
  const fetchProductos = async () => {
    try {
      const res = await authFetch('https://pastillapp.onrender.com/api/productos/');
      const data = await res.json();
      setProductos(Array.isArray(data) ? data : (data.results || []));
    } catch (e) { console.error(e); }
  };

  const fetchPacientes = async () => {
    try {
      const res = await authFetch('https://pastillapp.onrender.com/api/pacientes/'); 
      const data = await res.json();
      setPacientes(data); 
    } catch (e) { console.error(e); }
  };

  const fetchPedidos = async () => {
    try {
      const res = await authFetch('https://pastillapp.onrender.com/api/ventas/pedidos/');
      const data = await res.json();
      setPedidos(data);
    } catch (e) { console.error(e); }
  };

  const fetchGastos = async () => {
    try {
      const res = await authFetch('https://pastillapp.onrender.com/api/gastos/movimientos/');
      const data = await res.json();
      setGastos(data);
    } catch (e) { console.error(e); }
  };

  // --- 5. FUNCIONES DE ACTUALIZACIÓN (PATCH) ---
  const actualizarEstadoPedido = async (id, campo, valorActual) => {
    try {
      const res = await authFetch(`https://pastillapp.onrender.com/api/ventas/pedidos/${id}/`, {
        method: 'PATCH',
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
      const res = await authFetch(`https://pastillapp.onrender.com/api/productos/${id}/`, {
        method: 'PATCH',
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
      const res = await authFetch(`https://pastillapp.onrender.com/api/productos/${id}/`, {
        method: 'PATCH',
        body: JSON.stringify({ stock: parseInt(nuevoStock) })
      });
      if (res.ok) {
        toast({ title: "Stock actualizado", status: "success", duration: 2000 });
        fetchProductos();
      }
    } catch (e) { console.error(e); }
  };

  // --- 6. FUNCIONES POST ---
  const guardarPedido = async () => {
    const datosPedido = {
      paciente: pacienteSeleccionado.id,
      detalles: lineasPedido.map(l => ({ producto: parseInt(l.productoId), cantidad: parseInt(l.cantidad) }))
    };
    try {
      const res = await authFetch('https://pastillapp.onrender.com/api/ventas/pedidos/', {
        method: 'POST',
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
      const res = await authFetch('https://pastillapp.onrender.com/api/pacientes/', {
        method: 'POST',
        body: JSON.stringify(datos)
      });
      if (res.ok) {
        fetchPacientes(); setNuevoNombre(""); setNuevoApellido(""); setNuevoTelefono("");
        modalPaciente.onClose();
        toast({ title: "Paciente guardado", status: "success" });
      }
    } catch (e) { console.error(e); }
  };

  const guardarGasto = async () => {
    try {
      const res = await authFetch('https://pastillapp.onrender.com/api/gastos/movimientos/', {
        method: 'POST',
        body: JSON.stringify(nuevoGasto)
      });
      if (res.ok) {
        fetchGastos(); modalGasto.onClose();
        toast({ title: "Movimiento guardado", status: "success" });
      }
    } catch (e) { console.error(e); }
  };

  // --- 7. LÓGICA UI ---
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

  // --- VISTA LOGIN ---
  if (!token) {
    return (
      <Container maxW="sm" py={20}>
        <Card p={6}>
          <Heading size="md" mb={4} textAlign="center">Pastillapp 🔐</Heading>
          <Stack spacing={4}>
            <FormControl><FormLabel>Usuario</FormLabel><Input onChange={(e) => setUsername(e.target.value)} /></FormControl>
            <FormControl><FormLabel>Contraseña</FormLabel><Input type="password" onChange={(e) => setPassword(e.target.value)} /></FormControl>
            <Button colorScheme="blue" onClick={handleLogin}>Ingresar</Button>
          </Stack>
        </Card>
      </Container>
    );
  }

  // --- VISTA APP ---
  const pedidosPendientesEntrega = pedidos.filter(p => !p.entregado);
  const pedidosPendientesPago = pedidos.filter(p => !p.pagado);

  return (
    <Container maxW="container.xl" py={10}>
      <Flex justify="space-between" align="center" mb={8}>
        <Heading color="blue.600" textAlign="center">Pastillapp 💊</Heading>
        <Button size="sm" colorScheme="red" onClick={() => { setToken(null); localStorage.removeItem('token'); }}>Cerrar Sesión</Button>
      </Flex>

      <Tabs isFitted variant='soft-rounded' colorScheme='blue'>
        <TabList mb='1em'>
          <Tab>📝 Pedidos</Tab>
          <Tab>📜 Historial</Tab>
          <Tab>👥 Pacientes</Tab>
          <Tab>💊 Inventario</Tab>
          <Tab>💰 Mis Gastos</Tab>
        </TabList>

        <TabPanels>
          {/* TAB 1: PEDIDOS */}
          <TabPanel>
            <Flex justify="space-between" mb={6}>
              <Text fontSize="xl" fontWeight="bold">Tareas Pendientes</Text>
              <Button colorScheme="blue" onClick={modalPedido.onOpen}>+ Nueva Venta</Button>
            </Flex>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10}>
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
                            <Button size="xs" colorScheme="blue" mt={2} w="full" onClick={() => actualizarEstadoPedido(p.id, 'entregado', p.entregado)}>Marcar Entregado</Button>
                          </Box>
                        ))}
                      </Stack>
                    )}
                  </CardBody>
                </Card>
              </Box>
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
                              <Button size="xs" colorScheme="red" onClick={() => actualizarEstadoPedido(p.id, 'pagado', p.pagado)}>Cobrar</Button>
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

          {/* TAB 2: HISTORIAL */}
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

          {/* TAB 5: GASTOS */}
          <TabPanel>
            <Button colorScheme="green" mb={4} onClick={modalGasto.onOpen}>+ Nuevo Movimiento</Button>
            <SimpleGrid columns={{base: 1, md: 3}} spacing={4}>
              {gastos.map(g => (
                <Card key={g.id} borderLeft="5px solid" borderColor={g.tipo === 'INGRESO' ? 'green.400' : 'red.400'}>
                  <CardBody>
                    <Text fontWeight="bold">{g.descripcion}</Text>
                    <Text fontSize="lg" color={g.tipo === 'INGRESO' ? 'green.600' : 'red.600'}>
                        {g.tipo === 'INGRESO' ? '+' : '-'}${g.monto}
                    </Text>
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>
          </TabPanel>

        </TabPanels>
      </Tabs>

      {/* --- MODALES --- */}
      <Modal isOpen={modalPedido.isOpen} onClose={cerrarLimpiarPedido}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Cargar Nueva Venta</ModalHeader>
          <ModalBody>
             <Stack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Paciente</FormLabel>
                <Input placeholder="Buscar..." value={busqueda} onChange={(e) => {
                  setBusqueda(e.target.value);
                  setSugerencias(pacientes.filter(p => p.nombre.toLowerCase().includes(e.target.value.toLowerCase()) || p.apellido.toLowerCase().includes(e.target.value.toLowerCase())));
                }} />
                {sugerencias.length > 0 && (
                  <List bg="white" zIndex={10} border="1px solid #ccc">
                    {sugerencias.map(p => (
                      <ListItem key={p.id} p={2} onClick={() => { setBusqueda(`${p.apellido}, ${p.nombre}`); setPacienteSeleccionado(p); setSugerencias([]); }}>{p.apellido}, {p.nombre}</ListItem>
                    ))}
                  </List>
                )}
              </FormControl>
              {lineasPedido.map((linea, index) => (
                <Flex key={index} gap={2}>
                   <Select placeholder="Prod." value={linea.productoId} onChange={(e) => actualizarFila(index, 'productoId', e.target.value)}>
                    {productos.map(p => <option key={p.id} value={p.id}>{p.get_color_display} (${p.precio_actual})</option>)}
                   </Select>
                   <Input type="number" w="80px" value={linea.cantidad} onChange={(e) => actualizarFila(index, 'cantidad', e.target.value)} />
                </Flex>
              ))}
              <Button size="xs" onClick={agregarFila}>+ Agregar</Button>
            </Stack>
          </ModalBody>
          <ModalFooter>
             <Button colorScheme="purple" onClick={guardarPedido}>Confirmar</Button>
             <Button variant="ghost" onClick={cerrarLimpiarPedido}>Cerrar</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={modalPaciente.isOpen} onClose={modalPaciente.onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Nuevo Paciente</ModalHeader>
          <ModalBody>
             <Stack spacing={3}>
               <Input placeholder="Nombre" onChange={(e) => setNuevoNombre(e.target.value)} />
               <Input placeholder="Apellido" onChange={(e) => setNuevoApellido(e.target.value)} />
               <Input placeholder="Teléfono" onChange={(e) => setNuevoTelefono(e.target.value)} />
             </Stack>
          </ModalBody>
          <ModalFooter>
             <Button colorScheme="green" onClick={guardarPaciente}>Guardar</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={modalGasto.isOpen} onClose={modalGasto.onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Nuevo Movimiento</ModalHeader>
          <ModalBody>
            <Stack spacing={3}>
              <Input placeholder="Descripción" onChange={(e) => setNuevoGasto({...nuevoGasto, descripcion: e.target.value})}/>
              <Input type="number" placeholder="Monto" onChange={(e) => setNuevoGasto({...nuevoGasto, monto: e.target.value})}/>
              <RadioGroup onChange={(val) => setNuevoGasto({...nuevoGasto, tipo: val})} value={nuevoGasto.tipo}>
                <Stack direction='row'><Radio value='INGRESO'>Ingreso</Radio><Radio value='EGRESO'>Egreso</Radio></Stack>
              </RadioGroup>
            </Stack>
          </ModalBody>
          <ModalFooter><Button colorScheme="green" onClick={guardarGasto}>Guardar</Button></ModalFooter>
        </ModalContent>
      </Modal>

    </Container>
  )
}
export default App