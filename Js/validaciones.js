/**
 * Utilidades de validación para Makawi Store
 * Este archivo contiene funciones para validar diferentes tipos de datos
 */

// Validar nombre (solo letras y espacios)
function validarNombre(nombre) {
    if (!nombre || nombre.trim() === '') {
        return { valido: false, mensaje: 'Este campo es obligatorio' };
    }
    
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$/.test(nombre.trim())) {
        return { valido: false, mensaje: 'Solo letras permitidas' };
    }
    
    return { valido: true };
}

// Validar correo electrónico
function validarEmail(email) {
    if (!email || email.trim() === '') {
        return { valido: false, mensaje: 'Este campo es obligatorio' };
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        return { valido: false, mensaje: 'Correo inválido' };
    }
    
    return { valido: true };
}

// Validar teléfono (formato peruano o internacional)
function validarTelefono(telefono) {
    if (!telefono || telefono.trim() === '') {
        return { valido: false, mensaje: 'Este campo es obligatorio' };
    }
    
    // Formato peruano: 9 dígitos
    // Formato internacional: +51 seguido de 9 dígitos, o +[código país] seguido de 7-15 dígitos
    const formatoValido = (/^(\+?51)?[0-9]{9}$/.test(telefono) || /^\+[0-9]{1,3}[0-9]{7,15}$/.test(telefono));
    
    // Verificar que no todos los dígitos sean iguales
    const digitosNoIguales = !/^\+?(?:[0-9]+)?(\d)\1+$/.test(telefono);
    
    if (!formatoValido) {
        return { valido: false, mensaje: 'Formato de teléfono inválido' };
    }
    
    if (!digitosNoIguales) {
        return { valido: false, mensaje: 'El número no puede tener todos los dígitos iguales' };
    }
    
    return { valido: true };
}

// Validar número de documento según el tipo
function validarDocumento(numero, tipo) {
    if (!numero || numero.trim() === '') {
        return { valido: false, mensaje: 'Este campo es obligatorio' };
    }
    
    switch (tipo) {
        case 'dni':
            // DNI: 8 dígitos numéricos y no todos iguales
            if (!/^[0-9]{8}$/.test(numero)) {
                return { valido: false, mensaje: 'El DNI debe tener 8 dígitos numéricos' };
            }
            if (/^(\d)\1{7}$/.test(numero)) {
                return { valido: false, mensaje: 'El DNI no puede tener todos los dígitos iguales' };
            }
            break;
            
        case 'ce':
            // Carné de extranjería: alfanumérico de 9 caracteres y no todos iguales
            if (!/^[a-zA-Z0-9]{9}$/.test(numero)) {
                return { valido: false, mensaje: 'El CE debe tener 9 caracteres alfanuméricos' };
            }
            if (/^(.)\1{8}$/.test(numero)) {
                return { valido: false, mensaje: 'El CE no puede tener todos los caracteres iguales' };
            }
            break;
            
        case 'pasaporte':
            // Pasaporte: alfanumérico de 6-12 caracteres y no todos iguales
            if (!/^[a-zA-Z0-9]{6,12}$/.test(numero)) {
                return { valido: false, mensaje: 'El pasaporte debe tener entre 6 y 12 caracteres' };
            }
            if (/^(.)\1{5,11}$/.test(numero)) {
                return { valido: false, mensaje: 'El pasaporte no puede tener todos los caracteres iguales' };
            }
            break;
            
        default:
            // Otro tipo de documento
            if (numero.length === 0) {
                return { valido: false, mensaje: 'Ingrese un número de documento válido' };
            }
            if (/^(.)\1+$/.test(numero)) {
                return { valido: false, mensaje: 'El documento no puede tener todos los caracteres iguales' };
            }
    }
    
    return { valido: true };
}

// Validar número de tarjeta de crédito
function validarNumeroTarjeta(numero) {
    if (!numero || numero.trim() === '') {
        return { valido: false, mensaje: 'Este campo es obligatorio' };
    }
    
    // Eliminar espacios
    const numeroLimpio = numero.replace(/\s+/g, '');
    
    // Verificar longitud (13-19 dígitos)
    if (!/^\d{13,19}$/.test(numeroLimpio)) {
        return { valido: false, mensaje: 'Número de tarjeta inválido' };
    }
    
    // Algoritmo de Luhn (validación de checksum)
    let suma = 0;
    let doble = false;
    
    // Desde el último dígito hacia el primero
    for (let i = numeroLimpio.length - 1; i >= 0; i--) {
        let digito = parseInt(numeroLimpio.charAt(i));
        
        if (doble) {
            digito *= 2;
            if (digito > 9) {
                digito -= 9;
            }
        }
        
        suma += digito;
        doble = !doble;
    }
    
    // Si la suma es múltiplo de 10, la tarjeta es válida
    if (suma % 10 !== 0) {
        return { valido: false, mensaje: 'Número de tarjeta inválido' };
    }
    
    return { valido: true };
}

// Validar fecha de expiración de tarjeta (formato MM/YY)
function validarFechaExpiracion(fecha) {
    if (!fecha || fecha.trim() === '') {
        return { valido: false, mensaje: 'Este campo es obligatorio' };
    }
    
    // Verificar formato MM/YY
    if (!/^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(fecha)) {
        return { valido: false, mensaje: 'Formato inválido (debe ser MM/YY)' };
    }
    
    // Extraer mes y año
    const [mes, anio] = fecha.split('/');
    const mesActual = new Date().getMonth() + 1; // getMonth() devuelve 0-11
    const anioActual = new Date().getFullYear() % 100; // Últimos dos dígitos del año
    
    // Convertir a números
    const mesNum = parseInt(mes, 10);
    const anioNum = parseInt(anio, 10);
    
    // Verificar que la fecha no esté vencida
    if (anioNum < anioActual || (anioNum === anioActual && mesNum < mesActual)) {
        return { valido: false, mensaje: 'La tarjeta ha expirado' };
    }
    
    return { valido: true };
}

// Validar CVV de tarjeta
function validarCVV(cvv, tipoTarjeta = 'desconocido') {
    if (!cvv || cvv.trim() === '') {
        return { valido: false, mensaje: 'Este campo es obligatorio' };
    }
    
    // Verificar que solo contenga dígitos
    if (!/^\d+$/.test(cvv)) {
        return { valido: false, mensaje: 'El CVV debe contener solo números' };
    }
    
    // American Express usa CVV de 4 dígitos, el resto usa 3 dígitos
    if (tipoTarjeta.toLowerCase() === 'amex') {
        if (cvv.length !== 4) {
            return { valido: false, mensaje: 'El CVV para American Express debe tener 4 dígitos' };
        }
    } else {
        if (cvv.length !== 3) {
            return { valido: false, mensaje: 'El CVV debe tener 3 dígitos' };
        }
    }
    
    return { valido: true };
}

// Detectar tipo de tarjeta según su número
function detectarTipoTarjeta(numero) {
    // Eliminar espacios
    const numeroLimpio = numero.replace(/\s+/g, '');
    
    // Visa: comienza con 4
    if (/^4/.test(numeroLimpio)) return "visa";
    
    // Mastercard: comienza con 51-55 o 2221-2720
    if (/^5[1-5]/.test(numeroLimpio) || /^2[2-7][2-7][0-9]/.test(numeroLimpio)) return "mastercard";
    
    // American Express: comienza con 34 o 37
    if (/^3[47]/.test(numeroLimpio)) return "amex";
    
    // Discover: comienza con 6011, 622126-622925, 644-649, 65
    if (/^6(011|22(12[6-9]|1[3-9]|[2-8]|9[0-1][0-9]|92[0-5])|4[4-9]|5)/.test(numeroLimpio)) return "discover";
    
    // Diners Club: comienza con 300-305, 36, 38-39
    if (/^3(0[0-5]|[68][0-9])/.test(numeroLimpio)) return "diners";
    
    // JCB: comienza con 2131, 1800, 35
    if (/^(2131|1800|35)/.test(numeroLimpio)) return "jcb";
    
    return "desconocido";
}

// Formatear número de tarjeta con espacios cada 4 dígitos
function formatearNumeroTarjeta(numero) {
    if (!numero) return '';
    
    // Eliminar espacios y caracteres no numéricos
    const numeroLimpio = numero.replace(/\D/g, '');
    
    // Añadir un espacio cada 4 dígitos
    return numeroLimpio.replace(/(.{4})/g, '$1 ').trim();
}

// Formatear fecha de expiración como MM/YY
function formatearFechaExpiracion(fecha) {
    if (!fecha) return '';
    
    // Eliminar caracteres no numéricos
    let valor = fecha.replace(/\D/g, '');
    
    // Limitar a 4 dígitos
    valor = valor.substring(0, 4);
    
    // Formatear como MM/YY
    if (valor.length > 2) {
        valor = valor.substring(0, 2) + '/' + valor.substring(2);
    }
    
    return valor;
}

// Exportar todas las funciones
window.validaciones = {
    validarNombre,
    validarEmail,
    validarTelefono,
    validarDocumento,
    validarNumeroTarjeta,
    validarFechaExpiracion,
    validarCVV,
    detectarTipoTarjeta,
    formatearNumeroTarjeta,
    formatearFechaExpiracion
};