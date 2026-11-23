import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;

class PasswordHash {
    public static void main(String[] args) {
        var console = System.console();
        if (console == null) throw new IllegalStateException("Run this command in an interactive terminal.");
        char[] password = console.readPassword("Admin password: ");
        try {
            if (password == null || password.length == 0) throw new IllegalArgumentException("Password is required");
            String value = new String(password);
            if (value.getBytes(StandardCharsets.UTF_8).length > 72) throw new IllegalArgumentException("Use at most 72 UTF-8 bytes");
            console.printf("%s%n", new BCryptPasswordEncoder().encode(value));
        } finally {
            if (password != null) Arrays.fill(password, '\0');
        }
    }
}
