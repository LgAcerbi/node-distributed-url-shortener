interface CounterRepository {
    getNextValue(): Promise<number>;
}

export default CounterRepository;
export type { CounterRepository };