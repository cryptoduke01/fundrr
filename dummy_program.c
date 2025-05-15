#include <solana_sdk.h>

uint64_t helloworld(SolParameters *params) {
  // Log a message
  sol_log("Hello from Fundrr program!");
  return SUCCESS;
}

extern uint64_t entrypoint(const uint8_t *input) {
  SolParameters params = (SolParameters) { .ka = 0, .ka_num = 0, .data = input, .data_len = 0, .program_id = 0 };
  return helloworld(&params);
} 